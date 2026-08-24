<p align="center">
  <a href="https://garchi.co.uk">
    <img src="assets/logo.png" alt="Garchi CMS" height="70" title="Garchi CMS" />
  </a>
</p>

<h1 align="center">Garchi CMS for AI agents</h1>

<p align="center">
Build and manage structured websites and applications with Garchi CMS using AI agents, official starter kits and a production MCP integration.
</p>

---

Build with your preferred framework and AI coding agent while Garchi provides
the structured content backend. The application is written once; the business
keeps managing content afterwards without routine changes to application code.

## What Garchi CMS is

[Garchi CMS](https://garchi.co.uk) is a hosted headless CMS by
[LumenHarbor Digital Solutions Limited](https://lumenharbor.co.uk). Content is
organised as:

- **Spaces** — a work area owning everything below.
- **Pages** — an ordered list of **sections**, each an instance of a **section
  template**. A template defines **props**, which map to the props of a
  component in your codebase.
- **Data items** — itemable content (blog posts, products, events) with
  **categories** and key/value **metadata**.
- **Assets** — uploaded files used in page sections.

Your app fetches this over the REST API or the Node/PHP SDK and renders it. It
does not replace your framework, database or hosting.

## What this repository provides

One installable integration with three parts.

**MCP** — the hosted Garchi MCP server, `https://garchi.co.uk/mcp-oauth`. This
is how an agent reads and writes your live CMS: listing spaces, creating and
editing pages and sections, managing data items, categories, metadata and
assets.

**Skills** — instructions that teach an agent how to use Garchi correctly:

| Skill | Responsibility |
| --- | --- |
| [`garchi-build-site`](skills/garchi-build-site) | Orchestration: understand the goal, inspect the project, choose starter kit vs. integration, connect MCP, model the content, verify content stays editable without code changes. |
| [`garchi-render-content`](skills/garchi-render-content) | The application code: server-side client, page and section renderers, nested sections, data items, metadata, assets, preview mode. |
| [`garchi-manage-content`](skills/garchi-manage-content) | Content operations over MCP: pages, sections, templates, items, categories, assets — including how to handle destructive actions safely. |

**Starter kits** — official project scaffolds for Next.js, Nuxt and Laravel,
referenced (not copied) from
[skills/garchi-build-site/references/starter-kits.md](skills/garchi-build-site/references/starter-kits.md).

The repository is packaged as an [Agent Plugin](https://agent-plugins.org)
(`plugin.json` + `skills/` + `mcp.json`), with thin adapters for clients that
use their own manifest format. The skills live in one place: update a skill and
every supported agent gets the change.

## Supported agent environments

### Cursor

Cursor loads Agent Plugins natively. While the plugin is under marketplace
review, install it locally:

```bash
git clone https://github.com/lumenharbor/garchi-cms-skills.git ~/.cursor/plugins/local/garchi-cms
```

Then open **Customize** in the sidebar, find **Garchi CMS**, and authenticate
the `garchi` MCP server when prompted.

### Claude Code

Add this repository as a plugin marketplace, then install:

```bash
/plugin marketplace add lumenharbor/garchi-cms-skills
```

```bash
/plugin install garchi-cms@garchi-cms
```

Authorize the `garchi` MCP server with `/mcp` when prompted.

### Codex and the ChatGPT desktop app

Add the repository as a plugin marketplace source:

```bash
codex plugin marketplace add lumenharbor/garchi-cms-skills
```

Then install **Garchi CMS** from the Plugins Directory in the ChatGPT desktop
app and restart it.

If the bundled MCP server does not connect, add it to Codex directly and log
in:

```bash
codex mcp login garchi
```

Failing that, add the server by hand in `~/.codex/config.toml`:

```toml
[mcp_servers.garchi]
url = "https://garchi.co.uk/mcp-oauth"
```

### ChatGPT

Garchi CMS is registered as an MCP connector in ChatGPT:
[chatgpt.com/plugins/plugin_asdk_app_698da77dd2f48191ba19e15b0b188796](https://chatgpt.com/plugins/plugin_asdk_app_698da77dd2f48191ba19e15b0b188796).
Enable it there to use the Garchi tools in ChatGPT. The plugin's `.app.json`
points Codex and the ChatGPT desktop app at that same registered connector, so
a local install reuses it rather than registering the server twice.

### Any Agent Plugins-compatible client

Clients that implement the [Agent Plugins v1
specification](https://agent-plugins.org/specification) — VS Code and others —
read the root `plugin.json`, the `skills/` directory and `mcp.json` directly.
Point the client at this repository.

### Skills without a plugin host

To install just the skills into any of the agents supported by the `skills`
CLI:

```bash
npx skills add lumenharbor/garchi-cms-skills
```

Configure the MCP server separately — see
[garchi.co.uk/mcp-docs](https://garchi.co.uk/mcp-docs) for per-client
instructions, including the bearer-token endpoint for clients without OAuth
support.

## Example prompts

Once installed, these work without naming the MCP server, the skills or the
SDK:

- "Build a SaaS marketing site using Garchi CMS."
- "Use Garchi as the CMS for this existing Next.js project."
- "Connect this project to my Garchi space."
- "Create the About and Pricing pages in Garchi."
- "Render my Garchi pages in this frontend."
- "Add a blog to this site backed by Garchi data items."
- "Change the pricing copy in Garchi without changing the application code."
- "Use the official Garchi starter kit to start this project."

## Starter kits

| Framework | Repository | SDK |
| --- | --- | --- |
| Next.js | [garchi-next-starter-kit](https://github.com/lumenharbor/garchi-next-starter-kit) | [`@garchicms/garchi-node-sdk`](https://www.npmjs.com/package/@garchicms/garchi-node-sdk) |
| Nuxt | [garchi-nuxt-starter-kit](https://github.com/lumenharbor/garchi-nuxt-starter-kit) | [`@garchicms/garchi-node-sdk`](https://www.npmjs.com/package/@garchicms/garchi-node-sdk) |
| Laravel | [garchi-laravel-starter-kit](https://github.com/lumenharbor/garchi-laravel-starter-kit) | [`garchicms/garchi-sdk-php`](https://packagist.org/packages/garchicms/garchi-sdk-php) |

Bootstrap any of them:

```bash
npx @lumenharbor/garchi-starter-kit -k next
```

`-k` accepts `next`, `nuxt` or `laravel`.

Any other framework — SvelteKit, Astro, Django, Rails, React Native — integrates
through the Node SDK, the PHP SDK or the REST API instead. There is no scaffold
for those, but Garchi works the same way behind them.

## Security

- **Authentication is remote and OAuth-based.** The bundled MCP server is
  `https://garchi.co.uk/mcp-oauth`. It advertises OAuth 2.1 protected-resource
  metadata (RFC 9728) with PKCE (S256) and dynamic client registration, so
  supported clients run the authorization flow themselves and store the tokens.
- **This repository stores no credentials.** No API key, token or secret
  appears in any manifest, skill or reference file, and none is required to
  install the plugin. The `mcp.json` and `.mcp.json` entries carry a URL and
  nothing else.
- **Your Garchi permissions govern access.** The MCP server acts as the signed-in
  user. The plugin grants no access beyond what that account already has.
- **Destructive actions are confirmed.** `delete-section-tool` is the only
  destructive tool in the server's inventory, and
  [`garchi-manage-content`](skills/garchi-manage-content) requires an explicit,
  per-item confirmation before it runs, on top of your client's own tool
  approval prompts.
- **Application credentials stay server-side.** The `GARCHI_API_KEY` used by
  your app to read content is separate from MCP, is never exposed to the
  browser, and belongs in your own environment configuration — not in this
  repository.

## Documentation

- [Garchi CMS documentation](https://garchi.co.uk/documentation)
- [REST API](https://garchi.co.uk/docs/v2) · [OpenAPI spec](https://garchi.co.uk/docs/v2.openapi)
- [MCP client setup](https://garchi.co.uk/mcp-docs)

Agents can be wrong. Check the documentation when something does not behave as
a skill describes.

## License

MIT — see [LICENSE](LICENSE).
