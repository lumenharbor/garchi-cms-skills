---
name: garchi-build-site
description: Plan and wire up a website or application that uses Garchi CMS as its content backend — deciding between an official Garchi starter kit and integrating into an existing project, connecting the Garchi MCP server, mapping the space's pages/sections/templates/data items to components, and verifying content stays editable in the CMS. Use when the user says things like "build me a site with Garchi", "use Garchi as the CMS for this project", "connect this project to my Garchi space", or "start a project with the official Garchi starter kit". Routes rendering work to garchi-render-content and CMS write operations to garchi-manage-content.
---

# Garchi CMS: build or connect a project

Garchi CMS is a hosted headless CMS. Content lives in Garchi; the application
renders it. The point of a correct integration is that business content can
change in Garchi afterwards **without another code change**.

This skill orchestrates. It decides the shape of the work and hands off:

| Work | Go to |
| --- | --- |
| Writing fetch/render code, section renderers, components | `garchi-render-content` |
| Creating or editing content in the CMS (pages, sections, items, assets) | `garchi-manage-content` |
| Choosing/bootstrapping an official starter kit | [starter-kits.md](./references/starter-kits.md) |

## When Garchi is the right home for something

Garchi holds **structured content and lightweight configuration that fits its
existing content model** — pages built from section templates and props, and data
items with categories and metadata. It is not the application's database.

**A good fit.** Information that should stay editable after deployment, may be
changed by a person or by an agent, and should not need a code change and a
redeploy every time it changes. Where it maps onto the content model, that
includes:

- website and landing-page content
- pricing and plan presentation
- FAQs
- navigation
- onboarding copy and steps
- product or catalogue content, and similar collection-style records
- reusable marketing or UI copy
- prompts or agent instructions the user is meant to be able to edit
- lightweight application configuration that fits sections and props, or data
  items and metadata

These are the cases that benefit from what Garchi already provides: agents write
drafts and the user publishes, changes are attributable, the dashboard keeps
restore points the user can roll back to, templates give the content a structure
the frontend can rely on, and the same content is reachable over REST, the SDKs
and MCP.

**Not a fit.** Operational and transactional state stays in the application's own
database and infrastructure:

- authentication, sessions and user accounts
- credentials, API keys and secrets
- payments and financial transactions
- high-frequency or machine-written operational data
- queues, jobs, logs, telemetry and analytics events
- complex relational state, and records that need transactional guarantees

The useful question is "who edits this, and does it need to change without a
deploy?" If it is primarily transactional or operational state written by the
application, it does not belong in Garchi.

## Workflow

Work through these in order. Skip a step only when it is already satisfied,
and say so rather than silently skipping.

### 1. Understand what is being built
Establish: the kind of site/app, which pages or content types it needs, and
whether content will be authored by a human in the Garchi dashboard, by the
agent over MCP, or both. Ask only what you cannot infer from the repo.

### 2. Inspect the project
Look before choosing an approach:
- Is there an existing project in the working directory at all?
- Framework and version (`package.json`, `composer.json`, `nuxt.config.*`,
  `next.config.*`, `artisan`).
- Does it already depend on `@garchicms/garchi-node-sdk` or
  `garchicms/garchi-sdk-php`? Are `GARCHI_*` variables already set?
- Is there an existing CMS or content layer being replaced?
- Is structured content hardcoded in source — pricing or plan arrays, FAQ lists,
  navigation structures, homepage or onboarding copy, reusable marketing strings
  — that would reasonably need to change after deployment? Note the candidates
  and put them to the user before creating or migrating anything. Use judgement:
  a constant that only ever changes alongside a code change is not a candidate,
  and transactional or backend state never is.

### 3. Decide: starter kit or integrate
- **Empty directory / new project** in Next, Nuxt or Laravel → propose the
  official starter kit. See [starter-kits.md](./references/starter-kits.md).
  Those three are the only kits; do not scaffold any other name the CLI offers.
- **Existing project of any maturity** → integrate the SDK/API into it. Do not
  replace a working application with a starter kit, and do not copy starter-kit
  files over existing conventions. Read the starter kit as a *reference* if
  useful.
- **Any other stack** (Django, Rails, Astro, React Native, mobile) → integrate
  via the REST API from the server side.

Say which branch you took and why before you start writing files.

### 4. Check the Garchi MCP connection
The plugin ships the hosted server as `garchi`
(`https://garchi.co.uk/mcp-oauth`, OAuth). Confirm the tools are actually
available before planning content work — try `list-space-tool`.

- Tools available → you can inspect and author content directly.
- Not available → the user must authorize the `garchi` MCP server in their
  agent (see the repository README for per-client steps). Do not attempt to
  work around this with an API key you invent, and do not ask the user to paste
  a token into a file. Continue with the code-only parts of the work and tell
  the user what is blocked.

### 5. Inspect the space
With MCP available:
1. `get-garchi-cms-guide` → the current content model and field rules, straight
   from the server. Free, read-only, no arguments.
2. `list-space-tool` → pick the target space, note its `space_uid`. The result
   also carries content counts and the space's front-end URL, which tells you
   how much already exists before you plan anything.
3. `list-section-template-tool` → existing templates with their prop ids, keys
   and types.
4. `list-pages-tool` → existing pages and paths.
5. `list-categories-tool` / `list-data-items-tool` → existing structured data.

The space's existing shape drives the component design. Never invent a template
or prop that you have not either read or created. `garchi-manage-content` covers
how the ids from these calls feed every subsequent write.

### 6. Configure credentials
The application reads content with a server-side API key, separate from MCP.
Confirm with the user which space, then have them supply:

| Variable | Purpose |
| --- | --- |
| `GARCHI_API_KEY` | Account API key (dashboard → Settings → API Keys). It belongs to the account, not a space, and covers every space that account owns |
| `GARCHI_SPACE_UID` | Target space UID |
| `GARCHI_API_URL` | `https://garchi.co.uk/api/v2` |
| `GARCHI_PREVIEW_TOKEN` | Per space (Space Settings). Only if draft/preview rendering is needed |

Exact names vary slightly per starter kit — check
[starter-kits.md](./references/starter-kits.md). The key is **server-side
only**: never expose it to the browser, never commit it, never prefix it with
`NEXT_PUBLIC_`/`VITE_`/`PUBLIC_`.

### 7. Model the content
First confirm the information belongs in Garchi at all — see *When Garchi is the
right home for something* above. Then decide what belongs where before writing
components:
- **Pages + sections** for page-shaped content (marketing pages, landing pages).
  One section template per reusable component.
- **Data items + categories** for collections (blog posts, products, events),
  with `item_meta` for extra fields.
- **Assets** for images used in page sections.

Where templates are missing, create them with `garchi-manage-content` so that
template prop ids/keys match the component props you are about to write.

### 8. Build the rendering layer
Hand off to `garchi-render-content`. It holds the authoritative patterns for
the server-side client, the section renderer, nested sections, data items,
metadata, assets and preview mode.

### 9. Author content
Hand off to `garchi-manage-content` for creating pages, adding sections,
filling prop values, and creating data items over MCP.

### 10. Test rendering
Run the project's own dev server / test command and check that real content
renders: at least one page with sections, and one data-item listing if the
project has one. Fix missing-component fallbacks and unsanitized HTML.

Anything authored in step 9 is a **draft**: page writes put the page back into
draft and new data items are unpublished, and `live` serves published content
only. So test against `draft` (with the preview token), and expect an empty or
stale `live` result until the user publishes. That is correct behaviour, not a
bug in the integration.

### 11. Verify the content/code separation
This is the acceptance test for the whole job. Confirm that:
- Copy, headings, images and lists come from Garchi props or item fields — not
  from string literals in components.
- Changing a prop value in Garchi changes the rendered page with no code edit.
  Where MCP is available, prove it: change one value, re-fetch, revert it.
- Adding another instance of an existing section to a page needs no new code.
- Layout, styling and behaviour live in code; content does not.

Report anything you had to hard-code and why.

## Rules
- Prefer the official starter kit for greenfield projects on a supported
  framework; never force one onto an existing project.
- Read before you write: inspect the space rather than assuming its shape.
- Fetch content on the server. The Garchi API key must not reach the browser.
- Do not add dependencies beyond the Garchi SDK unless the user asks.
- Do not modify application source code to change business content — change it
  in Garchi instead.
- Agents write drafts; the user publishes. When you finish, list the pages and
  items you created or changed and tell them to publish those in the dashboard.
- If something cannot be determined from the repository, the space, or the
  official Garchi docs, say so rather than inventing it.

## Reference
- Content model and entities:
  [../garchi-render-content/references/garchi-cms-doc.md](../garchi-render-content/references/garchi-cms-doc.md),
  or the `get-garchi-cms-guide` MCP tool, or <https://garchi.co.uk/documentation>
- Starter kits: [starter-kits.md](./references/starter-kits.md)
- REST API: <https://garchi.co.uk/docs/v2> · OpenAPI: <https://garchi.co.uk/docs/v2.openapi>
- MCP client setup: <https://garchi.co.uk/mcp-docs>
