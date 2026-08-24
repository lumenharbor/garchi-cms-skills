# Repository guide

This repository is the canonical AI-agent integration for
[Garchi CMS](https://garchi.co.uk), a headless CMS by
[LumenHarbor Digital Solutions Limited](https://lumenharbor.co.uk). It is a
distribution package, not an application: no build step, no runtime code.

## Layout

```
plugin.json              Agent Plugins v1 manifest (canonical)
mcp.json                 Agent Plugins v1 MCP config — hosted Garchi MCP, OAuth
.mcp.json                Same server, Claude Code / Codex manifest format
.app.json                Codex mapping to the registered Garchi ChatGPT connector
.claude-plugin/          Claude Code plugin + marketplace manifests
.codex-plugin/           Codex / ChatGPT plugin manifest
.agents/plugins/         Codex repo marketplace entry
skills/                  The three skills — the only place skill content lives
assets/logo.png          Marketplace logo
```

## The skills

| Skill | Responsibility |
| --- | --- |
| `garchi-build-site` | Orchestration: pick starter kit vs. integration, connect MCP, model content, verify content stays editable without code changes. |
| `garchi-render-content` | Application code that fetches and renders Garchi content. |
| `garchi-manage-content` | Content operations over the Garchi MCP server. |

Their trigger conditions are deliberately disjoint. Keep them that way: an
agent should be able to tell from the descriptions alone which one applies.

## Working in this repository

- `skills/` is canonical. Never fork a skill per platform — the manifests all
  point at the same directory.
- Manifests carry metadata only. If you change the plugin name, version,
  description or logo path, change it in every manifest in the same commit.
- No secrets. Ever. The MCP entries carry a URL and nothing else;
  authentication is the client's OAuth flow against Garchi.
- Skill references live beside their skill in `references/`. Cross-skill links
  use relative paths and are only valid when the whole plugin is installed —
  always pair them with a public URL fallback.
- Do not vendor the starter kits. Reference the official repositories.

## Validating changes

```bash
npm run validate
```

That runs four checks in sequence:

| Script | Checks |
| --- | --- |
| `validate` (`scripts/validate.mjs`) | JSON syntax, Agent Plugins constraints, cross-manifest consistency, declared paths, skill frontmatter, duplicate triggers, internal links, committed secrets, obsolete API names |
| `validate:skills` | `skills-ref validate` on each skill |
| `validate:schemas` | Every manifest against its platform's published JSON Schema (needs network) |
| `validate:links` | Every external URL, including the starter-kit repositories (needs network) |

Where a platform CLI is installed, run its own validator too, for example
`claude plugin validate .`.

## Garchi reference

- Content model: [skills/garchi-render-content/references/garchi-cms-doc.md](skills/garchi-render-content/references/garchi-cms-doc.md)
- Node SDK: [skills/garchi-render-content/references/garchi-sdk-node.md](skills/garchi-render-content/references/garchi-sdk-node.md)
- PHP SDK: [skills/garchi-render-content/references/garchi-sdk-php.md](skills/garchi-render-content/references/garchi-sdk-php.md)
- MCP tools: [skills/garchi-manage-content/references/mcp-tools.md](skills/garchi-manage-content/references/mcp-tools.md)
- Starter kits: [skills/garchi-build-site/references/starter-kits.md](skills/garchi-build-site/references/starter-kits.md)
