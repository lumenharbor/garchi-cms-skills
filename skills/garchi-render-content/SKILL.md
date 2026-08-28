---
name: garchi-render-content
description: Write the application code that fetches and renders Garchi CMS content — the server-side Garchi client, page and section renderers, nested sections, data items (blogs/products), item metadata, assets, SEO metadata and draft/preview mode — in Next, Nuxt, Laravel, SvelteKit or any other stack, via the Node SDK, PHP SDK or REST API. Use when implementing or fixing the frontend/server integration for Garchi content. Code only — to create or edit the content itself use garchi-manage-content; to plan a whole project or pick a starter kit use garchi-build-site.
---

# Skill: garchi-render-content

## Scope
- ✅ Build or improve the code needed to **fetch and render** Garchi CMS content (pages, sections, data items).
- ✅ Integrate Garchi CMS into an existing codebase without breaking conventions.
- ❌ Do not manage CMS content (create pages/sections/assets/templates) here — that is `garchi-manage-content`, over MCP.
- ❌ Do not choose or bootstrap a starter kit here — that is `garchi-build-site`.

## Quick start: choose your path
1. **Fresh project → a starter kit is probably right.** Hand back to
   `garchi-build-site`, or read
   [starter-kits.md](../garchi-build-site/references/starter-kits.md). Kits ship
   the SDK, env config, a section renderer and example components.
2. **Existing project, Node or PHP backend → use the SDK** (`@garchicms/garchi-node-sdk` or `garchicms/garchi-sdk-php`).
3. **Existing project, any other backend → use the REST API** via the OpenAPI spec.
4. **Always render from the server** (SSR / server runtime). The API/SDK is **server-side only** and does not support client-side calls.

## Configuration contract
Confirm these exist before writing fetch code (starter kits create them for you):

| Env var | Purpose | Required |
| --- | --- | --- |
| `GARCHI_API_KEY` | Account API key used to authenticate all API/SDK calls. Account-level, not space-level: one key covers every space the account owns | Yes |
| `GARCHI_SPACE_UID` | Target space UID passed to most calls | Yes |
| `GARCHI_API_URL` | API base, `https://garchi.co.uk/api/v2` | Yes |
| `GARCHI_PREVIEW_TOKEN` | Enables draft/preview mode. Per space (Space Settings → Preview Token) | Only if preview is needed |

Nuxt keeps these values in `runtimeConfig` in `nuxt.config.ts` rather than in a
`.env` file. Match whatever the project already uses rather than introducing a
second convention.

**Rule:** the API key is **server-side only**. Never expose it to the client, never
prefix it with `NEXT_PUBLIC_`/`VITE_`/`PUBLIC_`, never commit it, and never call
the Garchi API from the browser.

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

2. **Content belongs in Garchi, not in components**
   - Copy, headings, image URLs and list contents come from section props or data-item fields. Do not hard-code them, and do not "temporarily" inline content that the CMS should own.
   - If a value has nowhere to live in the CMS yet, add the prop or template through `garchi-manage-content` rather than baking the value into code.
   - Components own layout, styling and behaviour. They should not encode which page they appear on.

3. **Do not modify reference snippets/docs**
   - Treat [code-snippets](./references/code-snippet.md) and provided examples as reference. Do not rewrite them unless asked.
   - The reference code is React/Next. Adapt the same logic to the target stack using its native primitives (component resolution, attribute forwarding, HTML sanitization).

4. **Keep codebase conventions**
   - Follow existing linting, formatting, naming, and folder conventions.
   - Reuse existing components (Markdown/HTML sanitizer, typography atoms) instead of adding new ones or new dependencies.
   - Avoid large refactors unless requested.

## Reference resources — load on demand
Read only what the current task needs. Do **not** fetch the full OpenAPI spec upfront.

| When you need to… | Load |
| --- | --- |
| Understand entities & hierarchy (space, page, section, data item, meta) | [garchi-cms-doc.md](./references/garchi-cms-doc.md) |
| Copy-adaptable rendering code (React reference) | [code-snippet.md](./references/code-snippet.md) |
| Node backend call signatures & types | [garchi-sdk-node.md](./references/garchi-sdk-node.md) |
| PHP backend call signatures & types | [garchi-sdk-php.md](./references/garchi-sdk-php.md) |
| Which starter kit ships what | [starter-kits.md](../garchi-build-site/references/starter-kits.md) |
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

**If a page or item renders empty in `live`, check whether it is published before
debugging the code.** Garchi serves published content only: page content writes put the
page back into draft, and data items are created unpublished, so freshly authored content
is missing from `live` by design until the user publishes it in the dashboard. Fetch the
same content in `draft` mode to confirm it exists.
- Errors are handled without infinite retries/loops.
- HTML content is sanitized where applicable.
- No content that belongs in Garchi is hard-coded in components.

## Loop prevention (stop conditions)
- Do not retry the same failing operation more than 2 times.
- After an update/fetch, verify state once; if still incorrect, stop and report what's missing.
