# Garchi MCP server reference

Server: `https://garchi.co.uk/mcp-oauth` (Streamable HTTP, OAuth 2.1 with PKCE
and dynamic client registration). A bearer-token variant is available at
`https://garchi.co.uk/mcp` for clients without OAuth support.

Argument names below match the tools' own schemas. Each tool still validates its
own input and returns a specific error naming the offending field — read that
error rather than guessing a different shape. Where no tool covers an operation,
the REST API may: <https://garchi.co.uk/docs/v2.openapi>.

`space_uid` is required by every space-scoped tool and comes from
`list-space-tool`.

## Safety annotations

Every tool declares MCP annotations, which your client may surface as approval
prompts. Summarised:

| Tool | Read-only | Idempotent | Destructive | Reaches the internet |
| --- | :-: | :-: | :-: | :-: |
| `get-garchi-cms-guide` | ✅ | ✅ | — | — |
| `list-space-tool` | ✅ | ✅ | — | — |
| `list-pages-tool` | ✅ | ✅ | — | — |
| `get-page-tool` | ✅ | ✅ | — | — |
| `list-section-template-tool` | ✅ | ✅ | — | — |
| `list-assets-tool` | ✅ | ✅ | — | — |
| `list-categories-tool` | ✅ | ✅ | — | — |
| `list-data-items-tool` | ✅ | ✅ | — | — |
| `get-data-item-tool` | ✅ | ✅ | — | — |
| `list-item-meta-tool` | ✅ | ✅ | — | — |
| `list-language-tool` | ✅ | ✅ | — | — |
| `create-page-tool` | — | — | — | — |
| `update-page-tool` | — | — | — | — |
| `create-section-tool` | — | — | — | — |
| `create-nested-section-tool` | — | — | — | — |
| `upsert-section-content-tool` | — | ✅ | — | — |
| `change-section-rank-tool` | — | ✅ | — | — |
| `change-nested-section-rank-tool` | — | ✅ | — | — |
| `create-section-template-tool` | — | — | — | — |
| **`update-prop-template-tool`** | — | ✅ | **✅** | — |
| **`delete-section-tool`** | — | ✅ | **✅** | — |
| `create-data-item-tool` | — | — | — | — |
| `update-data-item-tool` | — | — | — | — |
| `manage-category-tool` | — | — | — | — |
| `create-meta-for-item-tool` | — | — | — | — |
| `upload-asset-tool` | — | — | — | — |
| **`generate-image-tool`** | — | — | — | **✅** |
| `add-language-to-space-tool` | — | — | — | — |

The read-only tools are safe to call freely to orient yourself. The two
destructive tools need explicit per-item confirmation. `generate-image-tool`
reaches an external model and spends the account's image allowance.

## Orientation

**`get-garchi-cms-guide`** — no arguments. Returns the current content model,
field rules and tool ordering from the server. Call it first in any session that
will write content.

**`list-space-tool`** — no arguments. Returns every space the authenticated user
owns: `space_uid`, `name`, `agent_description`, `pages_count`, `items_count`,
`categories_count`, `section_templates_count`, `assets_count`, and
`front_end_url` when set. Start here. No tool creates a space — the user makes
one in the dashboard.

## Pages

**`list-pages-tool`** (`space_uid`) — every page in the space, with the
`page_id` that the section tools require.

**`get-page-tool`** (`space_uid`, `slug`, `mode`, `lang?`) — one page with its
full section tree, section ids and current prop values. `slug` is the URL path
(`/`, `/about`), **not** an id. `mode` is required and is `draft` or `live`; a
page with unpublished changes only resolves under `draft`. `lang` selects a
language variant.

**`create-page-tool`** (`space_uid`, `title`, `description`, `path`, `json_ld?`,
`agent_description?`) — creates the shell only, with no content. `title` and
`path` are unique within the space. `description` is the meta description;
`json_ld` is emitted as structured data. Counts against the plan's page limit.

**`update-page-tool`** (`id`, `space_uid`, plus any of `title`, `description`,
`path`, `json_ld`, `agent_description`) — page-level fields, including SEO.
Changing `path` changes the page's URL, so check what links to it first.

## Sections

**`create-section-tool`** (`space_uid`, `page_id`, `section_template_id`) — adds
a top-level section instantiating a template. Returns the new section's `id`,
`order`, `page_id` and template details. Adds no content.

**`create-nested-section-tool`** — same, plus `parent_id`. Use this, not
`create-section-tool`, when placing a section inside another.

**`upsert-section-content-tool`** (`space_uid`, `page_id`, `section_id`,
`props[]`, `language_id?`) — sets prop values. Merges by prop template id:
props sent are written, props omitted are untouched. Each `props` entry takes
`id` (the prop template id) plus `value` or `asset_id` per the type contract in
the skill. Send every prop for a section in one call.

**`change-section-rank-tool`** (`space_uid`, `page_id`, `section_id`,
`new_index`) — moves a top-level section to a new zero-based position.

**`change-nested-section-rank-tool`** — same, plus `parent_id`, for children.

**`delete-section-tool`** (`space_uid`, `section_id`, `page_id`) —
**destructive.** Removes the section, every nested section beneath it, and all
their prop values. On a published page it disappears from the live site. Section
ids come from `get-page-tool` with `mode=draft`. No MCP tool undoes this.

## Section templates and props

**`list-section-template-tool`** (`space_uid`) — every template with its props:
prop ids, keys, types and `allowed_values`. Read this before creating or filling
any section.

**`create-section-template-tool`** (`space_uid`, `name`, `description?`,
`agent_description?`, `props[]`) — a reusable blueprint. `name` should match the
component name in the codebase (`Hero`, `TeamCard`). `description` doubles as
the component import path used by the section renderer (`components/garchi/Hero`).
Each prop takes `key` (lowercase snake_case), `type`, and `allowed_values`
(comma-separated, required when `type` is `select`).

Prop types: `text`, `longtext`, `richtext`, `media`, `select`, `icon_lucid`,
`icon_hero`, `date`.

**`update-prop-template-tool`** (`space_uid`, `section_template_id`,
`prop_template_id`, plus any of `key`, `type`, `allowed_values`) —
**destructive.** A prop template belongs to a template that may be reused across
many pages, so changing `key` or `type` changes every section built from it and
can leave existing values invalid for the new type. Setting `type` to `select`
requires `allowed_values` in the same call. Renaming a key also breaks the
matching component prop until the code is updated.

## Data items

**`list-data-items-tool`** (`space_uid`) — items in the space.

**`get-data-item-tool`** (`space_uid`, `item_id`) — one item. `item_id` is
numeric.

**`create-data-item-tool`** (`space_uid`, `name`, `slug`, `categories[]`,
`detail_description`, plus optional `agent_description`, `sku`, `stock`,
`price`, `images[]`) — `slug` is unique in the space. `detail_description` is
the HTML body. `categories` needs at least one valid id. `sku`/`stock`/`price`
apply only to sellable items. `images` are base64 strings or data URIs, the
first becoming the featured image — data items never use space assets. Counts
against the plan's item limit.

**`update-data-item-tool`** (`item_id`, `space_uid`, plus any creatable field) —
same fields, all optional.

**`list-categories-tool`** (`space_uid`) — categories in the space.

**`manage-category-tool`** (`space_uid`, `category`, `action`, `category_id?`) —
`action` is `create` or `update` only; `category_id` is required for `update`.
There is no category delete over MCP. Creating counts against the plan's
category limit.

**`list-item-meta-tool`** (`space_uid`) — the metadata keys and types already in
use across the space. Read this before adding metadata so similar items stay
consistent and the frontend can rely on the shape.

**`create-meta-for-item-tool`** (`item_id`, `key`, `type`, `value`) — one extra
field on an item. `key` is at most 50 characters. `value` is always stored as a
string; `type` says how to read it:

| Type | Value format |
| --- | --- |
| `string`, `url`, `email`, `color`, `icon_lucid`, `icon_hero` | plain string |
| `numeric` | numeric string, e.g. `"42"`, `"19.99"` |
| `date` | date string, e.g. `"2026-07-08"` |
| `array` | JSON-stringified array, e.g. `"[\"a\",\"b\"]"` |
| `object` | JSON-stringified object, e.g. `"{\"author\":\"Ada\"}"` |

## Assets

**`list-assets-tool`** (`space_uid`) — the complete asset list in one response,
so pick an id from it directly and never loop. Clients that support MCP UI also
show the user a gallery of the same assets; if the user picks some, their ids
arrive as a follow-up message.

**`upload-asset-tool`** (`space_uid`, `file_name`, `file_type`,
`file_raw_content?`, `agent_description?`) — `file_type` must be an allowed MIME
type (images, PDF, Office documents, plain text and CSV) and the `file_name`
extension has to match it. For text types pass raw text; for binary pass base64
or a data URI. Omit `file_raw_content` — or pass `UPLOAD_VIA_BROWSER` — to open
an upload window for the user and get a short-lived signed upload URL instead;
that is the right route for anything but small files. Rate-limited per user.

**`generate-image-tool`** (`prompt`, `space_uid`, `image_for`, `orientation`,
`data_item_id?`) — reaches an external model and **spends the account's monthly
AI image allowance, shared across all spaces**. Ask the user first.
`image_for: page` saves a reusable space asset and returns an `asset_id` for a
section's media prop. `image_for: data_item` requires `data_item_id` and sets
that item's main image. `orientation` is `landscape`, `portrait` or `square` —
match it to the slot. Prompt maximum 200 words; describe subject, style, colour
and composition, leave a clear area for any text overlay, and do not ask for
text inside the image.

## Languages

**`list-language-tool`** (`space_uid`) — languages configured on the space.
Every space starts with `en-US`.

**`add-language-to-space-tool`** (`space_uid`, `language_id`) — adds a language
by i18n code (`fr-FR`, `es-ES`). Prop values are then writable per language via
`upsert-section-content-tool`'s `language_id`.

## Resources and prompt

The server also exposes MCP **resources**, useful when the task moves from
managing content to writing integration code. Load them on demand; they are not
needed for content operations:

| Resource | Contents |
| --- | --- |
| `garchi-cms-docs` | Garchi CMS features and content model |
| `garchi-api-docs` | The OpenAPI specification |
| `garchi-cms-node-sdk-resource` | Node SDK guide |
| `garchi-cms-php-sdk-resource` | PHP SDK guide |
| `garchi-cms-starter-kit-resource` | Starter-kit bootstrap commands |

There is also a `garchi-cms-assistant` prompt taking `tech_stack`
(`laravel`, `next`, `nuxt`, `node`, `php`, `other`) and an optional `goal`
(`continue`, `generate_code`, `troubleshoot`, `integrate`), which returns
guidance for that combination.

## What the server will not do

- Create a space.
- Publish a page — draft changes go live only when the owner publishes them in
  the dashboard.
- Delete a page, data item, category or section template.
- Restore anything. Garchi keeps automatic restore points for recent page,
  section-template and data item changes, available from the content history in
  the dashboard for a limited window, but no tool here rolls a change back.

## Safety model

- The server acts as the authenticated user. Their Garchi permissions bound
  everything an agent can do; the plugin adds no privileges of its own, and a
  space that is not theirs returns an authorization error.
- Read tools are free to call. Write tools change live content — read, write,
  then verify.
- The two destructive tools need explicit per-item confirmation on top of
  whatever approval your client asks for.
- Creating pages, items, categories and generated images is capped by the user's
  plan. A limit error is a billing state, not a transient failure — stop and
  report it instead of retrying.
- Tool calls are recorded against the user's account for their own audit and
  troubleshooting, so retry loops are neither free nor invisible.
- No credentials belong in this repository, in a skill or in a manifest.
  Authentication is the client's OAuth flow against Garchi.
