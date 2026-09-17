---
name: garchi-manage-content
description: Operate content in Garchi CMS through the Garchi MCP server — pages and their section trees, section templates and props, data items, categories, item metadata, assets, languages and social posts. Use when the user asks to add or edit pages, change copy or images, build a page from templates, create blog posts or products, reorder or remove sections, add translations, update SEO metadata, or turn Garchi content into a LinkedIn, Instagram or Facebook Page post for a person to approve. This is content operations, not code — for fetching and rendering content in an application use garchi-render-content.
---

# Garchi CMS: operating content over MCP

Content lives in the CMS. If the user wants different copy, a new page, a new
blog post or a different image, that is an MCP operation and the application
code should not change at all.

Requires the `garchi` MCP server. If its tools are unavailable, stop and ask the
user to authorize it. Do not substitute source edits for CMS edits.

**Start every session by calling `get-garchi-cms-guide`.** It is free,
read-only, takes no arguments, and returns the current content model and field
rules straight from the server. It is more current than this file. Read it
before planning any write.

## The one thing to understand: ids flow between calls

Almost every Garchi tool takes an id that a previous call returned. Nothing is
derivable, nothing is guessable. Most failed Garchi sessions are an agent
inventing an id instead of listing for it.

```
list-space-tool ─────────► space_uid ──► needed by nearly every other tool
                             │
    ┌────────────────────────┼────────────────────────┐
    ▼                        ▼                        ▼
list-section-template   list-pages-tool          list-categories-tool
    │                        │                        │
    │ section_template_id    │ page_id                │ category ids
    │ + prop template ids    │                        │
    ▼                        ▼                        ▼
create-section-tool ──► get-page-tool ──► section ids   create-data-item-tool
    │                    (mode=draft)         │                 │
    └──────────┬──────────────────────────────┘                 ▼
               ▼                                        create-meta-for-item
        upsert-section-content-tool
        (needs page_id + section_id + prop template ids)
```

Two id traps worth knowing:

- `get-page-tool` takes a **`slug`** (`/`, `/about`), not a page id. But
  `upsert-section-content-tool`, `delete-section-tool` and the rank tools take a
  **`page_id`**. Get the id from `list-pages-tool` and the section ids from
  `get-page-tool`.
- `get-data-item-tool`, `update-data-item-tool` and `create-meta-for-item-tool`
  take a numeric **`item_id`**, not the slug.

## Working rules

1. **Orient before writing.** `list-space-tool` first. It returns each space's
   `space_uid`, its `agent_description`, per-type content counts and, when set,
   the front-end URL — enough to tell which space the user means and what
   already exists, without further calls.
2. **Read before you edit.** `get-page-tool` with `mode=draft` (or
   `get-data-item-tool`) to see current values and ids before changing them.
3. **Verify after you write.** A success message confirms the call ran, not that
   the result is what the user wanted. Re-read and check the values landed.
4. **One upsert, all the props.** `upsert-section-content-tool` accepts an array
   of props. Fill a whole section in one call rather than one call per field.
5. **Don't re-list what you already have.** Template lists, asset lists and
   category lists are stable within a task. Fetch once, reuse. In particular,
   `list-assets-tool` returns the entire asset list in one response — never loop
   over it.
6. **Match the code to the content.** A section template's props become a
   component's props. When creating a template for an existing component, read
   the component first and mirror its props. When the component does not exist
   yet, say so — `garchi-render-content` builds it.

## Filling a section: the prop value contract

`upsert-section-content-tool` merges by prop template id. Props you send are
written; props you omit are left untouched. Send only what changes.

That is the contract for every Garchi write, not just this one: **only what you
provide changes.** A field or prop sent as `null` or `""` means "empty this"; one
you leave out keeps its current value. So blanking a heading or removing an
image is an explicit empty value, never an omission.

Because of that, never pad a request with nulls for arguments you are not
setting — send the fields that change and nothing else. The fields a record
cannot live without (a data item's `name`, `slug`, `detail_description` and
`categories`; a page's `title`, `description` and `path`) reject an empty value
outright, so a null-padded request fails rather than wiping content.

Each entry in `props` needs the prop template `id` plus **either** `value`
**or** `asset_id`, decided by the prop's type:

| Prop type | What to send |
| --- | --- |
| `media` | `asset_id` from `list-assets-tool`, in the same space. `value` is ignored. Send `asset_id: null` to remove the current image. |
| `select` | `value`, and it must be one of that prop's `allowed_values`. |
| `text`, `longtext`, `richtext`, `date` | `value` as a string. Send `""` to blank it. |
| `icon_lucid`, `icon_hero` | `value` = an icon name from that icon library. |

Sending `asset_id` for a non-media prop is rejected, and so is omitting it for a
media prop. Prop keys are lowercase snake_case.

Pass `language_id` to write a translated value for a space language other than
the default.

## Sequences that work

**Build a page**
1. `list-space-tool` → `space_uid`
2. `list-section-template-tool` → template ids, prop ids, prop types,
   `allowed_values`. If the space has no templates, `create-section-template-tool`
   first.
3. `create-page-tool` → the shell only: `title`, `path`, `description`
   (the meta description), optional `json_ld` for structured data.
4. `create-section-tool` per section — or `create-nested-section-tool` with a
   `parent_id` to place one inside another.
5. `upsert-section-content-tool` per section, all props at once.
6. `get-page-tool` with `mode=draft` → verify.

**Edit page content**
`list-pages-tool` → `get-page-tool` (`mode=draft`) → `upsert-section-content-tool`
with just the changed props → `get-page-tool` again.

**Reorder** — `change-section-rank-tool` with `new_index` for top-level
sections, `change-nested-section-rank-tool` (plus `parent_id`) for children.
This is what "move that section up" means; it is not a delete-and-recreate.

**Create a data item**
1. `list-categories-tool` → category ids (`manage-category-tool` with
   `action: create` if needed). An item needs at least one.
2. `list-item-meta-tool` → what keys and types similar items already use.
3. `create-data-item-tool` → `name`, unique `slug`, `categories`,
   `detail_description` (the HTML body), optional `one_liner` (a one line
   summary, max 1000 chars), optional `scheduled_for_datetime`, and `price`
   (decimals allowed) / `stock` / `sku` only for sellable items. `sku` is unique
   within the space.
4. `create-meta-for-item-tool` per extra field, reusing the keys and types from
   step 2.
5. `get-data-item-tool` → verify. The result carries `published`, which will be
   false.
6. Tell the user the item is a draft and needs publishing in the dashboard.

**Images** — two different systems, do not mix them:
- *Page sections* use space assets. `list-assets-tool` to find one,
  `upload-asset-tool` to add one, then set the `media` prop by `asset_id`. The
  asset must belong to the same space; an id from another space is rejected.
- *Data items* get their image from `generate-image-tool` alone. Create or
  update the item first, then call it with `image_for: data_item` and the item
  id. `create-data-item-tool` and `update-data-item-tool` take no image
  argument. Data items never use space assets.
- `generate-image-tool` covers both systems: `image_for: page` returns an
  `asset_id` to use in a section prop; `image_for: data_item` needs a
  `data_item_id` and sets that item's main image directly.
- You cannot read the user's files, so you never supply image bytes yourself.
  For a page asset the user supplies the file; for a data item the image is
  generated. If the user wants their own photo on a data item, say that the
  dashboard is the place for it (Manage → Add Images).

For `upload-asset-tool`, `file_type` must be an allowed MIME type and the
`file_name` extension has to match it. For an image, PDF or document, send only
`space_uid`, `file_name` and `file_type`: the tool opens an upload window for
the user and returns a short-lived signed upload URL for hosts that cannot
render that window. That is the only route for those types — do not try to send
file bytes. `file_raw_content` is for `text/plain` and `text/csv` only, where
you pass the plain text body. Uploads are rate-limited; if you hit that, wait
rather than retry in a loop.

## Social posts: you draft, a person publishes

A space can connect social channels (LinkedIn, and Instagram and Facebook Pages
where they are available to that account) in the Garchi dashboard. Each
connected Facebook Page is a separate channel. Over MCP you can read those
channels, draft posts from Garchi content, revise them and hand them to a person
for approval. **That is where your part ends.**

The six tools: `list-social-channels-tool`, `create-social-post-tool`,
`update-social-post-tool`, `get-social-post-tool`, `list-social-posts-tool` and
`request-social-post-approval-tool`.

**Only a person, in the dashboard, can** approve a post, publish it, schedule or
reschedule it, cancel it or withdraw its approval, retry a failed publish, edit a
post that is already live on the network, delete a live post, or connect and
reconnect a channel. No tool does any of these, and asking for one will not
produce one. Do not suggest workarounds.

**Turn a page or item into a post**
1. `get-page-tool` (`mode=draft`) or `get-data-item-tool` — read the source.
2. `list-social-channels-tool` → `channel_id`s. Skip a channel with
   `usable: false` and tell the user it needs reconnecting.
3. Write copy suited to each network yourself.
4. `create-social-post-tool` with `body`, `channel_ids`, optional `media`, and
   `source_type`/`source_id` pointing at what it was written from.
5. `request-social-post-approval-tool`. This checks the post against every
   selected network's rules; an error names the channel and the problem. Fix it
   with `update-social-post-tool` and ask again.
6. Tell the user the post is waiting for their approval in the dashboard. Stop.

Rules that matter:

- **Media is referenced, never uploaded.** `media` entries are
  `{"source": "space_asset", "id": "<asset id>"}` from `list-assets-tool`, or
  `{"source": "data_item_image", "id": "<item id>"}` for an item's feature
  image. No URLs.
- **A post has text only, images, or exactly one video** — never both. Attaching
  a video removes the other media; attaching an image removes a video.
- **Video must already be a space asset** (`type: uploaded-video`).
  `upload-asset-tool` does not accept video, so ask the user to upload it in the
  dashboard. LinkedIn takes MP4; Instagram (as a Reel) and Facebook Pages take
  MP4 or MOV; 500 MB maximum. Garchi checks the file type and size, not codecs or duration, and
  never converts video — the network can still reject a file after approval.
- **Editing an approved or scheduled post withdraws its approval.** It returns to
  `pending_approval`. Say so whenever you edit one.
- **Publishing spends the space's credits**: one per successful publish to one
  channel, so a post to LinkedIn and Instagram uses two. Failed and cancelled
  publishes use none; deleting a published post gives none back. Every social
  tool returns `publishing_allowance`. When `can_publish_more` is false you may
  still draft, but tell the user it cannot publish until they upgrade.

Tool details, network rules and worked examples:
[social-publishing.md](./references/social-publishing.md).

## Leave notes for the next agent

Spaces, pages, section templates, data items and assets each accept an
`agent_description` — a field meant for agents, not visitors. Use it to record
what a template is for, when a page should be used, or what an asset shows. It
costs one field on a write you are already making and it is what a later session
reads instead of guessing. Fill it in whenever you create something.

## Draft, live, and what MCP cannot do

**You write drafts. A human publishes.** Nothing here reaches the live site on
its own, and that review step is the point: the user sees the change before
their visitors do.

**Pages.** Every content write puts the page back into draft. Verify with
`mode=draft`. `mode=live` keeps serving the last published version, so the site
never shows a half-finished edit — and your change is not visible until the
owner publishes again. A page that has never been published returns "no
published version" on `live`. Rendering drafts in an application needs a preview
token — see `garchi-render-content`.

**Data items.** New and updated items are drafts (`published: false`), and the
content API serves published items only, so a fresh item is not on the site yet.
The exception is `scheduled_for_datetime` (`Y-m-d H:i`, in the future): the item
stays a draft until that time, then Garchi publishes it automatically.

**End every content task by saying what you changed and that the user needs to
publish it in the dashboard.** Reading your work back over MCP shows drafts, so
a clean verification is not evidence that anything is live.

Several things are deliberately outside this server. Tell the user to do them in
the Garchi dashboard rather than looking for a tool:

- **Creating a space.** No tool creates one.
- **Publishing a page or a data item.** Both go live only when the owner
  publishes them in the dashboard.
- **Deleting pages, data items, categories or section templates.**
  `delete-section-tool` is the only delete here, and `manage-category-tool` only
  creates and updates.
- **Anything past requesting approval for a social post**: approving,
  scheduling, publishing, cancelling, retrying, editing or deleting a live post,
  and connecting a channel.

## Before a change that is hard to undo

Two tools change or remove content that other content depends on:

- **`delete-section-tool`** removes a section, every nested section under it, and
  all their prop values. If the page is published, the section stops appearing on
  the live site.
- **`update-prop-template-tool`** changes a prop's `key` or `type` on a template
  that may be used by many sections across many pages. Existing values can become
  invalid for the new type, and published pages reflect the change. Renaming a
  key also breaks the matching component prop in the codebase until that is
  updated too.

For either one:

1. Read first — `get-page-tool` (`mode=draft`) or `list-section-template-tool` —
   so you are acting on the right target.
2. Name the exact page and section, or the exact template and prop, and get an
   explicit yes. "Tidy up this page" is not approval to delete anything.
3. Confirm one item at a time. For a batch, show the full list first.
4. For a prop change, check what the change breaks on the rendering side and say
   so before making it.

Garchi keeps automatic restore points for recent page, section-template and data
item changes, restorable from the content history in the dashboard. Treat that
as a safety net for the user, not a licence to act without asking: the window is
limited, and **no MCP tool restores anything** — from here every one of these
changes is final.

## Costs and plan limits

`generate-image-tool` spends part of the account's monthly AI image allowance,
shared across all of the user's spaces. Ask before generating, keep the prompt
under 200 words, describe subject, style, colour and composition, leave a clear
zone where text will overlay, and do not ask for text inside the image.

Creating pages, data items, categories and generated images is capped by the
user's subscription plan. When a tool reports a limit reached or no active
subscription, **stop** — that is a billing state, not a transient failure.
Retrying it burns calls and changes nothing. Report which limit was hit and what
was created before it.

Social publishing credits are counted per space: 2 on Sandbox, 300 on Basic,
unlimited on Pro, unlimited or custom on Business. Drafting and requesting
approval never spend them — only a successful publish does, and a person starts
that. Read `publishing_allowance` rather than assuming a plan.

## Stop conditions

- Never retry a failing call more than twice. Re-read the state, then report.
- A validation error names the exact field and rule. Fix that field; do not
  resend the same payload hoping for a different outcome.
- If an id is missing, list for it. Never guess one.
- Tool calls are recorded against the user's account, so loops are not free.

## Reference

- [mcp-tools.md](./references/mcp-tools.md) — full tool inventory, arguments,
  and safety annotations
- [social-publishing.md](./references/social-publishing.md) — social post tools,
  network rules, the approval boundary and worked examples
- `get-garchi-cms-guide` — the live content model from the server
- Content model background:
  [../garchi-render-content/references/garchi-cms-doc.md](../garchi-render-content/references/garchi-cms-doc.md)
  or <https://garchi.co.uk/documentation>
