#!/usr/bin/env node
// Checks every external URL referenced from the repository's markdown and
// manifests. Needs network access; network errors are reported but do not fail
// the run, so only genuine 4xx/5xx responses break the build.

import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "..");

const walk = async (dir, out = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(md|json)$/.test(e.name)) out.push(p);
  }
  return out;
};

const URL_RE = /https?:\/\/[^\s"'`)>\]}]+/g;
const TRAILING = /[.,;:]+$/;

const urls = new Map(); // url -> Set of files
for (const file of await walk(root)) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(URL_RE)) {
    const url = match[0].replace(TRAILING, "");
    if (!urls.has(url)) urls.set(url, new Set());
    urls.get(url).add(relative(root, file));
  }
}

// API and MCP endpoints are not browsable pages: a plain GET is expected to be
// rejected. For these we only assert that the host answers at all.
const ENDPOINTS = [
  "https://garchi.co.uk/api/v2",
  "https://garchi.co.uk/mcp",
  "https://garchi.co.uk/mcp-oauth",
];
const isEndpoint = (url) => ENDPOINTS.some((e) => url.replace(/\/$/, "") === e);

const probe = async (url) => {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
        headers: { "user-agent": "garchi-cms-skills-link-check" },
      });
      // Some hosts reject HEAD outright; retry those with GET.
      if (method === "HEAD" && (res.status === 403 || res.status === 405)) continue;
      return { status: res.status };
    } catch (e) {
      if (method === "GET") return { error: e.message };
    }
  }
  return { error: "unreachable" };
};

const sorted = [...urls.keys()].sort();
const results = await Promise.all(sorted.map(async (u) => [u, await probe(u)]));

let broken = 0;
let unreachable = 0;

for (const [url, result] of results) {
  const where = [...urls.get(url)].join(", ");
  if (result.error) {
    unreachable++;
    console.warn(`WARN  ${url} - ${result.error}  (${where})`);
  } else if (isEndpoint(url)) {
    // Any HTTP answer proves the endpoint exists; only a server fault is a problem.
    if (result.status >= 500) {
      broken++;
      console.error(`FAIL  ${url} - HTTP ${result.status}  (${where})`);
    }
  } else if (result.status === 403 || result.status === 429) {
    unreachable++;
    console.warn(`WARN  ${url} - HTTP ${result.status}, likely bot protection  (${where})`);
  } else if (result.status >= 400) {
    broken++;
    console.error(`FAIL  ${url} - HTTP ${result.status}  (${where})`);
  }
}

console.log(
  `\n${sorted.length} URLs checked, ${broken} broken, ${unreachable} unreachable`
);
process.exit(broken ? 1 : 0);
