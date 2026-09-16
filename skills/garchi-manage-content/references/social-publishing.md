# Social publishing over MCP

A Garchi space can connect social channels and publish posts written from its
own content. Over MCP an agent prepares those posts. A person approves and
publishes them in the Garchi dashboard.

## The boundary

| An agent can | Only a person, in the dashboard, can |
| --- | --- |
| List the space's connected channels | Connect, reconnect or disconnect a channel |
| Read pages, data items and assets to write from | Approve a post, or withdraw its approval |
| Create a post as a draft | Publish a post now |
| Change a post's text, media and channels | Schedule, reschedule or cancel a post |
| Read a post, its status and recent activity | Retry a failed publish |
| List posts, filtered by status | Edit or delete a post that is live on the network |
| Request approval | |

No MCP tool approves, schedules or publishes, and none will appear if you ask.
When a task needs one of the right-hand actions, finish your part and tell the
user exactly what is waiting for them.

## Tools

All six take `space_uid` from `list-space-tool`. None reaches the internet;
nothing is sent to a social network by any of them.

| Tool | Read-only | Idempotent | Destructive |
| --- | :-: | :-: | :-: |
| `list-social-channels-tool` | ✅ | ✅ | — |
| `list-social-posts-tool` | ✅ | ✅ | — |
| `get-social-post-tool` | ✅ | ✅ | — |
| `create-social-post-tool` | — | — | — |
| `update-social-post-tool` | — | ✅ | ✅ |
| `request-social-post-approval-tool` | — | ✅ | — |

**`list-social-channels-tool`** (`space_uid`) — the connected channels:
`channel_id`, `provider`, `provider_label`, `account_name`, `account_type`,
`status` (`active`, `needs_reconnect`, `revoked`), `usable` and `status_reason`.
A channel with `usable: false` cannot publish until the user reconnects it; tell
them rather than targeting it. This list is the only source of truth for which
networks a space has — do not assume a network is available because this file
mentions it.

**`create-social-post-tool`** (`space_uid`, `body`, `channel_ids[]?`, `media[]?`,
`source_type?`, `source_id?`) — creates a draft. `channel_ids` come from
`list-social-channels-tool`; they are required before approval can be requested,
not before saving. `source_type` is `page` or `data_item` and records where the
post came from; the post does not change when that source changes later.
Calling it twice creates two drafts.

**`update-social-post-tool`** (`space_uid`, `post_id`, plus any of `body`,
`channel_ids[]`, `media[]`) — only the fields you send change. `channel_ids`
replaces the channel list; `media` replaces **all** attached media, so send the
full list you want. A post that is publishing or already published cannot be
edited. Marked destructive because it can withdraw an approval — see below.

**`get-social-post-tool`** (`space_uid`, `post_id`) — the post in full: `body`,
`status`, `is_approved`, `scheduled_at`, `channels` (each with its
`delivery_status` and, once live, `provider_url`), `media`, and
`recent_activity` showing who changed what, including whether an agent did.
Read the post back after every write.

**`list-social-posts-tool`** (`space_uid`, `status?`, `limit?`) — newest first,
up to 100 (default 25). `status` is one of `draft`, `pending_approval`,
`approved`, `scheduled`, `publishing`, `published`, `failed`, `cancelled`.

**`request-social-post-approval-tool`** (`space_uid`, `post_id`) — the last step
an agent can take. The post needs at least one channel, and it is checked
against every selected network's rules. A refusal names the channel and the
reason; fix the post with `update-social-post-tool` and ask again. On success
the post is `pending_approval`.

Every write returns `next_step` — follow it — and `publishing_allowance`.

## Media

Media is always something that already exists in Garchi. Nothing is uploaded or
copied, and a URL is never accepted.

```json
{ "source": "space_asset", "id": "<asset id from list-assets-tool>", "alt_text": "optional" }
{ "source": "data_item_image", "id": "<data item id>" }
```

- An asset must belong to the same space.
- A data item's feature image is captured when attached; a later change to the
  item does not change the post.
- A post carries **text only, images, or exactly one video**. Attaching a video
  removes every other attachment; attaching an image removes a video. There are
  no mixed image-and-video posts and no multi-video posts.
- Video has to be a space asset with `type: uploaded-video` in
  `list-assets-tool`. `upload-asset-tool` does not accept video, so a new video
  is uploaded by the user in the dashboard (500 MB maximum).
- Garchi does not edit, crop, compress or transcode anything.

## Network rules

Checked when approval is requested, and again when a person approves.

**LinkedIn**
- Text is required, up to 3,000 characters.
- One image, or one video.
- Video: MP4 only, between 75 KB and 500 MB.

**Instagram** — only when the space has an Instagram channel connected.
- An image or a video is required. Caption up to 2,200 characters, at most 30
  hashtags and 20 @mentions.
- One image, with an aspect ratio between 4:5 and 1.91:1. It is never cropped;
  choose a different image if it does not fit.
- One video, published as a Reel: MP4 or MOV, up to 500 MB.

**Facebook Pages** — only when the space has a Facebook Page connected. Each
connected Page is its own channel; personal profiles and Groups are not
supported.
- Text, one image, or one video. Text up to 63,206 characters.
- Image: JPEG, PNG or GIF, up to 10 MB.
- Video: MP4 or MOV, up to 500 MB.

For video, Garchi verifies the file type and size only. The network processes
the video itself and can still refuse it for its codec, duration, frame rate or
audio. That refusal happens after approval, shows as a failed channel in the
dashboard, and uses no credit. Do not tell the user a video is guaranteed to
publish.

## Approval is tied to the exact content

Changing the text, media or channels of a post that is `approved` or
`scheduled` withdraws the approval and returns it to `pending_approval`. The
response says so in `approval_invalidated_by_this_edit`. Tell the user it needs
approving again — even for a one-word change.

## Publishing credits

Counted **per space**:

| Plan | Credits per space |
| --- | --- |
| Sandbox | 2 |
| Basic | 300 |
| Pro | Unlimited |
| Business | Unlimited or custom |

- One successful publish to one channel uses one credit. A post published to
  LinkedIn and Instagram uses two.
- Failed and cancelled publishes use none. A retry that eventually succeeds uses
  one.
- Deleting a published post does not give credits back.
- Drafts and approval requests never use credits.

`publishing_allowance` carries `publishing_credits_used`,
`publishing_credits_limit`, `publishing_credits_remaining` and
`can_publish_more`. When `can_publish_more` is false, still draft if asked, and
tell the user the post cannot publish until the plan changes. Never try to get
around it.

## Worked examples

**"Turn our About page into a LinkedIn post"**
1. `list-pages-tool` → `get-page-tool` (`slug: /about`, `mode: draft`).
2. `list-social-channels-tool` → the LinkedIn `channel_id`; check `usable`.
3. Write the copy: under 3,000 characters, written for LinkedIn rather than
   pasted from the page.
4. If the user wants an image, pick one from `list-assets-tool`.
5. `create-social-post-tool` with `body`, `channel_ids: [<linkedin id>]`,
   `media`, `source_type: page`, `source_id: <page id>`.
6. `get-social-post-tool` → check it landed as intended.
7. `request-social-post-approval-tool`.
8. Report: "The LinkedIn post is waiting for your approval in the Garchi
   dashboard." Stop there.

**"Prepare this product for LinkedIn and Instagram"**
1. `get-data-item-tool` → the item's copy and whether it has a feature image.
2. `list-social-channels-tool` → both `channel_id`s. If Instagram is not in the
   list, say the space has no Instagram channel and continue with LinkedIn.
3. Both networks share one `body`, so write copy that fits the stricter limit
   (Instagram's 2,200 characters) and works without links being clickable.
4. Media: the item's feature image (`data_item_image`), or a video asset if the
   user asked for one. Instagram needs one or the other.
5. `create-social-post-tool` with both channels and `source_type: data_item`.
6. `request-social-post-approval-tool`. If it refuses — say, the image is too
   tall for Instagram, or the video is MOV and LinkedIn only takes MP4 — report
   the exact reason and offer the choices: a different asset, or dropping that
   channel with `update-social-post-tool`. Do not pick for the user.
7. Tell the user the post is waiting for approval and uses two credits if both
   channels publish.

**"Fix the typo in the post I approved yesterday"**
1. `list-social-posts-tool` (`status: approved` or `scheduled`) →
   `get-social-post-tool`.
2. Tell the user this edit will withdraw the approval, then make it with
   `update-social-post-tool` sending only `body`.
3. Confirm `approval_invalidated_by_this_edit`, and tell the user to approve it
   again.

## When something goes wrong

| What you see | What to do |
| --- | --- |
| A channel has `usable: false` | Ask the user to reconnect it in the dashboard. Leave it off the post. |
| Approval refused for a network rule | Fix the named problem with `update-social-post-tool`, then request approval again. |
| "Some attached media is no longer available" | The asset was deleted. Attach a replacement or remove the media. |
| `can_publish_more` is false | Draft if asked, and tell the user the space is out of publishing credits. |
| A channel shows `delivery_status: failed` | Tell the user. Retrying is done by a person in the dashboard. |
| The user asks you to publish, schedule or approve | Explain that a person does this in the dashboard, and point them to the post. |
