#!/usr/bin/env node
// Validates every plugin manifest against its platform's published JSON Schema.
// Needs network access; skips (without failing) when a schema cannot be fetched.

import Ajv2020 from "ajv/dist/2020.js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const TARGETS = [
  {
    file: "plugin.json",
    label: "Agent Plugins v1 manifest",
    schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  },
  {
    file: "mcp.json",
    label: "Agent Plugins v1 MCP config",
    schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  },
  {
    file: ".codex-plugin/plugin.json",
    label: "Codex plugin manifest",
    schema: "https://www.schemastore.org/codex-plugin-manifest.json",
  },
  {
    file: ".claude-plugin/plugin.json",
    label: "Claude Code plugin manifest",
    schema: "https://www.schemastore.org/claude-code-plugin-manifest.json",
  },
  {
    file: ".claude-plugin/marketplace.json",
    label: "Claude Code marketplace",
    schema: "https://www.schemastore.org/claude-code-marketplace.json",
  },
];

let failures = 0;
let skipped = 0;

for (const target of TARGETS) {
  const path = join(root, target.file);
  if (!existsSync(path)) {
    console.error(`FAIL  ${target.file} is missing`);
    failures++;
    continue;
  }

  let schema;
  try {
    const res = await fetch(target.schema, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    schema = await res.json();
  } catch (e) {
    console.warn(`SKIP  ${target.file} - could not fetch ${target.schema} (${e.message})`);
    skipped++;
    continue;
  }

  const Compiler = String(schema.$schema ?? "").includes("2020-12") ? Ajv2020 : Ajv;
  const ajv = new Compiler({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const doc = JSON.parse(readFileSync(path, "utf8"));

  if (validate(doc)) {
    console.log(`PASS  ${target.file}  (${target.label})`);
  } else {
    failures++;
    console.error(`FAIL  ${target.file}  (${target.label})`);
    for (const e of validate.errors) {
      console.error(`        ${e.instancePath || "/"} ${e.message}`);
    }
  }
}

console.log(`\n${TARGETS.length - failures - skipped} passed, ${failures} failed, ${skipped} skipped`);
process.exit(failures ? 1 : 0);
