#!/usr/bin/env node
// Repository validator: manifests, skills, links, secrets and disclosure.
// No third-party dependencies - safe to run anywhere Node 18+ is available.
//
// WHAT THIS CANNOT DO. These checks are pattern matching over the working tree.
// They are a regression ratchet, not an assurance of safety:
//
//   * Prose is invisible to them. A paragraph describing internal architecture
//     in plain English matches no pattern here and will pass.
//   * Only known identifiers are screened. A new internal class, table or
//     hostname is unknown until someone adds it to INTERNAL_PATTERNS.
//   * Git history is out of scope. This reads the working tree only; a secret
//     removed from HEAD stays recoverable from history and must be handled by
//     rotation and history rewriting, not by this script.
//   * Entropy detection is heuristic and finds no low-entropy credential.
//
// Every change to a published file still needs human review.

import { readFileSync, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, dirname, resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const readJson = (rel) => {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    fail(`invalid JSON in ${rel}: ${e.message}`);
    return null;
  }
};

/* ---------- manifests ---------- */

const agentPlugin = readJson("plugin.json");
const agentMcp = readJson("mcp.json");
const clientMcp = readJson(".mcp.json");
const claudePlugin = readJson(".claude-plugin/plugin.json");
const claudeMarket = readJson(".claude-plugin/marketplace.json");
const codexPlugin = readJson(".codex-plugin/plugin.json");
const codexMarket = readJson(".agents/plugins/marketplace.json");
const codexApps = readJson(".app.json");

const NAME_RE = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const AP_PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const AP_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const AP_PLUGIN_FIELDS = new Set([
  "$schema", "name", "version", "description", "author",
  "homepage", "repository", "license", "keywords", "extensions",
]);

if (agentPlugin) {
  if (agentPlugin.$schema !== AP_PLUGIN_SCHEMA) {
    fail(`plugin.json: $schema must be ${AP_PLUGIN_SCHEMA}`);
  }
  if (!agentPlugin.name || !NAME_RE.test(agentPlugin.name)) {
    fail(`plugin.json: invalid name "${agentPlugin.name}"`);
  }
  if (agentPlugin.name && agentPlugin.name.length > 64) {
    fail("plugin.json: name exceeds 64 chars");
  }
  for (const k of Object.keys(agentPlugin)) {
    if (!AP_PLUGIN_FIELDS.has(k)) {
      fail(`plugin.json: unknown top-level field "${k}" (schema is closed)`);
    }
  }
  if (!agentPlugin.description) warn("plugin.json: no description");
}

const checkMcp = (doc, file, { schema, transports }) => {
  if (!doc) return;
  if (schema) {
    if (doc.$schema !== schema) fail(`${file}: $schema must be ${schema}`);
    for (const k of Object.keys(doc)) {
      if (k !== "$schema" && k !== "mcpServers") {
        fail(`${file}: unknown top-level field "${k}"`);
      }
    }
  }
  if (!doc.mcpServers || typeof doc.mcpServers !== "object") {
    fail(`${file}: missing mcpServers object`);
    return;
  }
  for (const [id, srv] of Object.entries(doc.mcpServers)) {
    if (!NAME_RE.test(id)) warn(`${file}: server id "${id}" is not lowercase kebab-case`);
    if (srv.command) continue; // stdio server
    if (!srv.url) {
      fail(`${file}: server "${id}" has neither url nor command`);
      continue;
    }
    if (!srv.url.startsWith("https://")) {
      fail(`${file}: server "${id}" url must be https`);
    }
    if (transports && !transports.includes(srv.type)) {
      fail(`${file}: server "${id}" type "${srv.type}" not one of ${transports.join(", ")}`);
    }
    if (srv.headers) {
      fail(`${file}: server "${id}" declares headers - no credentials belong in a manifest`);
    }
  }
};

checkMcp(agentMcp, "mcp.json", { schema: AP_MCP_SCHEMA, transports: ["streamable-http", "sse"] });
checkMcp(clientMcp, ".mcp.json", { transports: ["http", "sse"] });

// The two MCP files must describe the same servers at the same URLs.
if (agentMcp?.mcpServers && clientMcp?.mcpServers) {
  const a = Object.entries(agentMcp.mcpServers).map(([k, v]) => `${k}=${v.url}`).sort().join(",");
  const b = Object.entries(clientMcp.mcpServers).map(([k, v]) => `${k}=${v.url}`).sort().join(",");
  if (a !== b) fail(`mcp.json and .mcp.json disagree: "${a}" vs "${b}"`);
}

/* ---------- cross-manifest consistency ---------- */

const identity = [
  ["plugin.json", agentPlugin],
  [".claude-plugin/plugin.json", claudePlugin],
  [".codex-plugin/plugin.json", codexPlugin],
].filter(([, m]) => m);

for (const field of ["name", "version", "description"]) {
  const values = new Set(identity.map(([, m]) => m[field]));
  if (values.size > 1) {
    const shown = identity.map(([f, m]) => `${f}=${JSON.stringify(m[field])}`).join(" ");
    fail(`manifests disagree on "${field}": ${shown}`);
  }
}

const pluginName = agentPlugin?.name;
const markets = [
  [".claude-plugin/marketplace.json", claudeMarket],
  [".agents/plugins/marketplace.json", codexMarket],
];
for (const [file, market] of markets) {
  if (!market) continue;
  if (!market.name) fail(`${file}: missing name`);
  if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
    fail(`${file}: plugins[] missing or empty`);
    continue;
  }
  for (const entry of market.plugins) {
    if (entry.name !== pluginName) {
      fail(`${file}: entry "${entry.name}" does not match plugin name "${pluginName}"`);
    }
    const path = typeof entry.source === "string" ? entry.source : entry.source?.path;
    if (!path) fail(`${file}: entry "${entry.name}" has no source path`);
    else if (path.includes("..")) fail(`${file}: entry "${entry.name}" source escapes the repository`);
    else if (!existsSync(join(root, path))) {
      fail(`${file}: entry "${entry.name}" source "${path}" does not exist`);
    }
  }
}
if (claudeMarket && !claudeMarket.owner?.name) {
  fail(".claude-plugin/marketplace.json: owner.name is required");
}
for (const entry of codexMarket?.plugins ?? []) {
  for (const req of ["policy.installation", "policy.authentication", "category"]) {
    const value = req.split(".").reduce((o, k) => o?.[k], entry);
    if (!value) fail(`.agents/plugins/marketplace.json: entry "${entry.name}" missing ${req}`);
  }
}

/* ---------- declared paths and assets ---------- */

const declaredPaths = [
  [".claude-plugin/plugin.json", claudePlugin?.mcpServers],
  [".codex-plugin/plugin.json", codexPlugin?.skills],
  [".codex-plugin/plugin.json", codexPlugin?.mcpServers],
  [".codex-plugin/plugin.json", codexPlugin?.apps],
  [".codex-plugin/plugin.json", codexPlugin?.interface?.logo],
  [".codex-plugin/plugin.json", codexPlugin?.interface?.composerIcon],
];
for (const [file, p] of declaredPaths) {
  if (typeof p !== "string") continue;
  if (!p.startsWith("./")) fail(`${file}: path "${p}" must start with ./`);
  if (p.includes("..")) fail(`${file}: path "${p}" escapes the plugin root`);
  if (!existsSync(join(root, p))) fail(`${file}: declared path "${p}" does not exist`);
}

/* ---------- registered connector mapping ---------- */

// The ChatGPT connector page URL ends in `plugin_asdk_app_<hex>`, but the
// manifest id drops that `plugin_` prefix. Verified against all 154 .app.json
// files published in github.com/openai/plugins: 125 use `asdk_app_`, 30 use
// `connector_`, 1 uses `templated_`, and none begins with `plugin_`.
const APP_ID_RE = /^(?:asdk_app|connector|templated)_[0-9a-f]{32}$/;

if (codexApps) {
  const entries = Object.entries(codexApps.apps ?? {});
  if (entries.length === 0) fail(".app.json: apps object is empty");
  for (const [name, app] of entries) {
    if (!app?.id) {
      fail(`.app.json: app "${name}" has no id`);
    } else if (app.id.startsWith("plugin_")) {
      fail(
        `.app.json: app "${name}" id "${app.id}" keeps the plugin_ prefix that ` +
        `appears in the connector page URL. The manifest form omits it: ` +
        `"${app.id.replace(/^plugin_/, "")}"`
      );
    } else if (!APP_ID_RE.test(app.id)) {
      warn(`.app.json: app "${name}" id "${app.id}" does not match a known registered-connector id form`);
    }
  }
}

/* ---------- skills ---------- */

const skillsDir = join(root, "skills");
const skillDirs = existsSync(skillsDir)
  ? (await readdir(skillsDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

if (skillDirs.length === 0) fail("skills/ contains no skills");

const descriptions = new Map();
for (const dir of skillDirs) {
  const file = join(skillsDir, dir, "SKILL.md");
  const rel = `skills/${dir}/SKILL.md`;
  if (!existsSync(file)) {
    fail(`${dir}: no SKILL.md`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const matched = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!matched) {
    fail(`${rel}: no YAML frontmatter`);
    continue;
  }

  const fm = {};
  for (const line of matched[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
    else if (line.trim() && !/^\s/.test(line)) {
      fail(`${rel}: unparseable frontmatter line: ${line}`);
    }
  }
  if (!fm.name) fail(`${rel}: frontmatter missing name`);
  else if (fm.name !== dir) fail(`${rel}: frontmatter name "${fm.name}" != directory "${dir}"`);
  else if (!NAME_RE.test(fm.name)) fail(`${rel}: name "${fm.name}" is not kebab-case`);

  if (!fm.description) {
    fail(`${rel}: frontmatter missing description`);
  } else {
    if (fm.description.length < 40) warn(`${rel}: description is very short`);
    if (fm.description.length > 1024) warn(`${rel}: description exceeds 1024 chars`);
    for (const [other, d] of descriptions) {
      if (d === fm.description) {
        fail(`${rel}: description is identical to ${other} - triggers would collide`);
      }
    }
    descriptions.set(rel, fm.description);
  }
}

/* ---------- internal links ---------- */

const walk = async (dir, out = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
};

const files = await walk(root);
const markdown = files.filter((f) => f.endsWith(".md"));
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)\)|<img[^>]+src="([^"]+)"/g;

for (const file of markdown) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(LINK_RE)) {
    const target = m[1] ?? m[2];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = target.split("#")[0];
    if (!path) continue;
    if (!existsSync(resolve(dirname(file), path))) {
      fail(`${relative(root, file)}: broken link -> ${target}`);
    }
  }
}

/* ---------- secrets ---------- */

const SECRET_PATTERNS = [
  [/Bearer\s+[A-Za-z0-9._~+/-]{16,}/g, "bearer token"],
  [/\b\d+\|[A-Za-z0-9]{32,}\b/g, "Sanctum-style API token"],
  [/\bsk-[A-Za-z0-9_-]{16,}\b/g, "OpenAI-style secret key"],
  [/\b(?:pk|sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, "Stripe-style key"],
  [/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, "AWS access key id"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/g, "GitHub token"],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "GitHub fine-grained token"],
  [/\bnpm_[A-Za-z0-9]{30,}\b/g, "npm token"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "Slack token"],
  [/\bAIza[0-9A-Za-z_-]{30,}\b/g, "Google API key"],
  [/\bya29\.[A-Za-z0-9_-]{20,}\b/g, "Google OAuth token"],
  [/\bSG\.[A-Za-z0-9_-]{20,}\b/g, "SendGrid key"],
  [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g, "private key block"],
  [/-----BEGIN CERTIFICATE-----/g, "certificate"],
  [/\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\./g, "JWT"],
  [/\b[a-z]+:\/\/[^\s:@/]+:[^\s:@/]+@/g, "URL with inline credentials"],
  [/(api[_-]?key|secret|passwd|password|token|credential)\s*[:=]\s*["'][^"'\s]{12,}["']/gi, "assigned credential"],
];

// Infrastructure and non-public hosts must never reach a published file.
const INFRA_PATTERNS = [
  [/\barn:aws:[a-z0-9-]+:/g, "AWS ARN"],
  [/\b[a-z0-9.-]*\.(?:amazonaws\.com|elasticbeanstalk\.com|cloudfront\.net)\b/g, "AWS hostname"],
  [/\bs3:\/\/[a-z0-9.-]+/g, "S3 bucket URI"],
  [/\bhttps?:\/\/(?:staging|stage|dev|qa|test|preprod|internal|admin)[.-][^\s"')]+/gi, "non-production hostname"],
  [/\bhttps?:\/\/[^\s"')]*\.(?:local|internal|lan)\b/g, "internal hostname"],
  [/\bhttps?:\/\/(?:10|127)\.\d+\.\d+\.\d+/g, "private IP URL"],
  [/\bhttps?:\/\/192\.168\.\d+\.\d+/g, "private IP URL"],
  [/[?&](?:X-Amz-Signature|Signature|sig|access_token)=[A-Za-z0-9%._-]{8,}/gi, "signed or tokenised URL"],
];

const PLACEHOLDER = /\byour[_-]?\w*|YourAPIToken|placeholder|example|xxx|PUT YOUR|\$\{|<your/i;

/** Shannon entropy in bits per character. */
const entropy = (s) => {
  const counts = new Map();
  for (const ch of s) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  let bits = 0;
  for (const n of counts.values()) {
    const p = n / s.length;
    bits -= p * Math.log2(p);
  }
  return bits;
};

const HIGH_ENTROPY_TOKEN = /[A-Za-z0-9+/=_-]{28,}/g;
// Long strings that legitimately look random but carry no secret.
const ENTROPY_BENIGN = /(sha\d{3}-|integrity|data:image|base64|[A-Za-z]{4,}[-_][A-Za-z]{4,})/i;

for (const file of files) {
  const rel = relative(root, file);
  // The validator necessarily contains these patterns as source, so scanning it
  // against itself would report every rule as a finding.
  if (rel === "package-lock.json" || rel.startsWith("scripts/")) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\u0000")) continue; // binary
  for (const [re, label] of [...SECRET_PATTERNS, ...INFRA_PATTERNS]) {
    for (const hit of text.matchAll(re)) {
      if (PLACEHOLDER.test(hit[0])) continue;
      fail(`${rel}: possible ${label} in a published file: ${hit[0].slice(0, 24)}`);
    }
  }

  for (const hit of text.matchAll(HIGH_ENTROPY_TOKEN)) {
    const token = hit[0];
    if (ENTROPY_BENIGN.test(token) || PLACEHOLDER.test(token)) continue;
    if (entropy(token) >= 4.5) {
      warn(`${rel}: high-entropy string, confirm it is not a credential: ${token.slice(0, 12)}`);
    }
  }
}

// Binary assets carry authorship, tooling and document ids in metadata chunks,
// which ship to every marketplace that renders the logo.
for (const file of files) {
  const rel = relative(root, file);
  if (!/\.png$/i.test(rel)) continue;
  const buf = readFileSync(file);
  let i = 8;
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString("latin1", i + 4, i + 8);
    if (["tEXt", "iTXt", "zTXt", "eXIf"].includes(type)) {
      fail(`${rel}: image ships a ${type} metadata chunk - strip it before publishing`);
    }
    if (type === "IEND") break;
    i += 12 + len;
  }
}

/* ---------- confidentiality ---------- */

// This repository is public. Skills document the MCP server's observable
// contract - tool names, arguments and behaviour, all of which every connected
// client already receives. Server internals must not appear here.
const INTERNAL_PATTERNS = [
  [/\bApp\\(?:Mcp|Http|Services|Helper|Trait|Models)\b/g, "internal PHP namespace"],
  [/\b(?:SnapshotManager|RestoreManager|ContentHistoryService|DataItemHelper|AssetUploadService|PropTemplate|McpValidationTrait|LoggedCallTool|GenerateImageHelper|SpaceProductService)\b/g, "internal class name"],
  [/\bapp\/(?:Mcp|Http|Services|Helper|Trait|Models)\//g, "internal source path"],
  [/\bstorage_path\(|\bstorage\/garchi-skills\b/g, "server filesystem path"],
  [/\bSNAPSHOT_(?:DAYS|MAX_PER_ENTITY|DEDUPE)\b/g, "server config key"],
  [/\bwhitelabel(?:ownerid|id)\b/gi, "internal database column"],
  [/\b(?:content_snapshots|space_assets|prop_templates|mcp_tool_calls)\b/g, "internal database table"],
  [/\bMAX_REQUESTS_PER_MINUTE\b|\bINLINE_BINARY_SOFT_LIMIT\b|\bMAX_APP_UPLOAD_BYTES\b/g, "internal rate/size constant"],
];

// Scans every published file, not just skills/. Manifests, marketplace metadata
// and validation scripts are published too. scripts/ is exempt because this file
// necessarily names the identifiers it screens for.
for (const file of files) {
  const rel = relative(root, file);
  if (rel === "package-lock.json" || rel.startsWith("scripts/")) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes(" ")) continue;
  for (const [re, label] of INTERNAL_PATTERNS) {
    for (const hit of text.matchAll(re)) {
      fail(`${rel}: ${label} exposed in a public file: ${hit[0]}`);
    }
  }
}

/* ---------- MCP endpoint allow-list ---------- */

// Only the intentionally public production endpoints may ship. This catches a
// staging or tenant-specific URL being pasted into a manifest.
const ALLOWED_MCP_URLS = new Set([
  "https://garchi.co.uk/mcp-oauth",
  "https://garchi.co.uk/mcp",
]);
for (const [file, doc] of [["mcp.json", agentMcp], [".mcp.json", clientMcp]]) {
  for (const [id, srv] of Object.entries(doc?.mcpServers ?? {})) {
    if (srv.url && !ALLOWED_MCP_URLS.has(srv.url)) {
      fail(`${file}: server "${id}" points at an unapproved endpoint: ${srv.url}`);
    }
  }
}

/* ---------- stale references ---------- */

for (const file of markdown) {
  const text = readFileSync(file, "utf8");
  const rel = relative(root, file);
  if (/garchicms\/garchi-php-sdk/.test(text)) {
    fail(`${rel}: obsolete composer package name (use garchicms/garchi-sdk-php)`);
  }
  if (/create-section-content-tool/.test(text)) {
    fail(`${rel}: obsolete MCP tool name (use upsert-section-content-tool)`);
  }
  if (/\.\/resources\//.test(text)) {
    fail(`${rel}: stale ./resources/ path (references/ now)`);
  }
  // The SvelteKit starter kit was retired. SvelteKit remains a supported
  // rendering target through the SDK and REST API, so only the kit itself -
  // its repository and its CLI flag - must stay out of the docs.
  if (/garchi-sveltekit-starter-kit/.test(text)) {
    fail(`${rel}: references the retired SvelteKit starter kit`);
  }
  if (/-k\s+sveltekit|`sveltekit`/.test(text)) {
    fail(`${rel}: offers the retired sveltekit starter-kit option`);
  }
}

/* ---------- report ---------- */

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
  `\n${skillDirs.length} skills, ${markdown.length} markdown files, ` +
  `${errors.length} error(s), ${warnings.length} warning(s)`
);
process.exit(errors.length ? 1 : 0);
