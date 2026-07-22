---
name: garchi-render-content
description: Render and integrate content from Garchi CMS (headless pages, sections, and data items) into an app or website — Next, Nuxt, Laravel, SvelteKit, or any stack. Use when fetching Garchi content via the Node/PHP SDK or REST API, wiring a section renderer, rendering data items (blogs/products), enabling draft/preview mode, or scaffolding a Garchi integration. Covers code architecture, fetching, and rendering only; create/manage content via the Garchi MCP tools or dashboard.
---

# Skill: garchi-render-content

## Scope
- ✅ Build or improve the code needed to **fetch and render** Garchi CMS content (pages, sections, data items).
- ✅ Integrate Garchi CMS into an existing codebase without breaking conventions.
- ❌ Do not manage CMS content (create pages/sections/assets/templates) unless the user explicitly asks. Prefer MCP tools for CMS actions.

## Quick start: choose your path
1. **Fresh project → use a starter kit.** Ask the user which stack, then scaffold:
   ```bash
   npx @lumenharbor/garchi-starter-kit -k next   # or: nuxt | laravel | sveltekit
   ```
   Starter kits ship the SDK, `.env`, example section components, and Tailwind. Prefer this for greenfield work.
2. **Existing project, Node or PHP backend → use the SDK** (`@garchicms/garchi-node-sdk` or `garchicms/garchi-php-sdk`).
3. **Existing project, any other backend → use the REST API** via the OpenAPI spec.
4. **Always render from the server** (SSR / server runtime). The API/SDK is **server-side only** and does not support client-side calls.

## Configuration contract
Confirm these exist before writing fetch code (starter kits create them for you):

| Env var | Purpose | Required |
| --- | --- | --- |
| `GARCHI_API_KEY` | Space API key used to authenticate all API/SDK calls | Yes |
| `GARCHI_SPACE_UID` | Target space UID passed to most calls | Yes |
| `GARCHI_PREVIEW_TOKEN` | Enables draft/preview mode (Space Settings → Preview Token) | Only if preview is needed |

**Rule:** the API key is **server-side only**. Never expose it to the client or call the Garchi API from the browser.

## Always (non-negotiable rules)
1. **Preserve Visual Editor attributes**
   - For every section component, forward unknown/extra props/attributes to the **root element** (outermost wrapper).
   - Framework-agnostic rule: "Unknown attributes must not be dropped; attach them to the root/host element."
   - Patterns:
     - React/Preact/Solid: spread `...other` on root
     - Vue: `v-bind="$attrs"` on root (if `inheritAttrs: false`, re-bind manually)
     - Svelte: spread `...$$restProps` on root
     - Angular: preserve/pass through host attributes; do not strip unknown attrs
     - Web Components: keep attrs on host or forward to outer wrapper
     - Laravel Blade: ensure attributes are passed to the root element of the section component `{{ $attributes->merge() }}`

2. **Do not modify reference snippets/docs**
   - Treat [code-snippets](./resources/code-snippet.md) and provided examples as reference. Do not rewrite them unless asked.
   - The reference code is React/Next. Adapt the same logic to the target stack using its native primitives (component resolution, attribute forwarding, HTML sanitization).

3. **Keep codebase conventions**
   - Follow existing linting, formatting, naming, and folder conventions.
   - Reuse existing components (Markdown/HTML sanitizer, typography atoms) instead of adding new ones or new dependencies.
   - Avoid large refactors unless requested.

## Reference resources — load on demand
Read only what the current task needs. Do **not** fetch the full OpenAPI spec upfront.

| When you need to… | Load |
| --- | --- |
| Understand entities & hierarchy (space, page, section, data item, meta) | [garchi-cms-doc.md](./resources/garchi-cms-doc.md) |
| Copy-adaptable rendering code (React reference) | [code-snippet.md](./resources/code-snippet.md) |
| Node backend call signatures & types | [garchi-sdk-node.md](./resources/garchi-sdk-node.md) |
| PHP backend call signatures & types | [garchi-sdk-php.md](./resources/garchi-sdk-php.md) |
| Exact request/response shapes, or an endpoint not in the SDK | [OpenAPI spec](https://garchi.co.uk/docs/v2.openapi) |

## Recommended implementation workflow
### A) Choose access method
- Prefer starter kits for fresh projects (see Quick start).
- Prefer SDKs where available (Node / PHP).
- If using the raw API, create a small server-side service layer (DRY/SOLID, typed, reusable). Raw API calls must be made from the server. Use the OpenAPI spec for reference.

### B) Build the rendering pipeline
1. Fetch page/data item from server-side (SSR/server runtime).
2. Render sections via a single section renderer (mapper) — `GarchiComponent`.
3. Each section maps to a reusable component (resolved from the section `description`, falling back to `name`).
4. Support nested sections (`subsections`) if present — the renderer is reused recursively.

### C) Quality + safety
- Sanitize HTML before rendering (XSS). Reuse the project's sanitizer/Markdown atom if present.
- Handle errors gracefully (notFound, fallback UI).
- Use stable keys (prefer section id/uid over array index).
- Add a consistent "missing component" fallback that fails gracefully and logs what's missing.
- Cache/revalidate page fetches appropriately; fetch lists (assets/templates) once and reuse.
- Prefer typed section props; validate critical CMS payload shape at boundaries where helpful.

## Definition of Done
- Pages/data items render correctly in the chosen stack.
- Visual Editor attributes are preserved on all section components.
- Preview/draft mode works (if required).
- Errors are handled without infinite retries/loops.
- HTML content is sanitized where applicable.

## Loop prevention (stop conditions)
- Do not retry the same failing operation more than 2 times.
- After an update/fetch, verify state once; if still incorrect, stop and report what's missing.
