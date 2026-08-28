# Official Garchi CMS starter kits

Three officially maintained scaffolds, each a Git repository under
[github.com/lumenharbor](https://github.com/lumenharbor). They ship the SDK, a
server-side Garchi client, a section renderer and example section components.

Do not vendor these repositories into a project's history — clone or bootstrap
them, then delete the example content you do not need.

## Bootstrap

One CLI clones the right repo, installs dependencies and (for Laravel) prepares
`.env` and the app key:

```bash
npx @lumenharbor/garchi-starter-kit -k next
```

`-k` accepts `next`, `nuxt` or `laravel`. `-n <name>` sets the target
directory. The CLI offers to install these agent skills at the end; if they are
already installed as a plugin, decline.

The CLI may still advertise other kit names. Only the three below are
maintained — do not scaffold anything else.

Cloning directly works too, and is the better choice when you only want the
repo as a reading reference.

## The kits

| Kit | Repository | SDK | Notes |
| --- | --- | --- | --- |
| Next.js | [garchi-next-starter-kit](https://github.com/lumenharbor/garchi-next-starter-kit) | `@garchicms/garchi-node-sdk` | App Router, server components, Tailwind v4, `sanitize-html` |
| Nuxt | [garchi-nuxt-starter-kit](https://github.com/lumenharbor/garchi-nuxt-starter-kit) | `@garchicms/garchi-node-sdk` | Nuxt 4, Tailwind v4, `sanitize-html` |
| Laravel | [garchi-laravel-starter-kit](https://github.com/lumenharbor/garchi-laravel-starter-kit) | `garchicms/garchi-sdk-php` | Laravel 13, Blade section components, `mews/purifier` |

## Environment variables per kit

All three kits use the same four keys. Only where they are written differs.

**Next.js** — `.env.local`:

```env
GARCHI_API_URL=https://garchi.co.uk/api/v2
GARCHI_API_KEY=your_api_key
GARCHI_SPACE_UID=your_space_uid
GARCHI_PREVIEW_TOKEN=your_preview_token_from_space_settings
```

**Laravel** — `.env` (same four keys, appended to the standard Laravel file).

**Nuxt** — no `.env`. The values live in `runtimeConfig` in `nuxt.config.ts`,
at the top level so they stay server-only:

```ts
runtimeConfig: {
  GARCHI_API_URL: "https://garchi.co.uk/api/v2",
  GARCHI_API_KEY: "your_api_key",
  GARCHI_PREVIEW_TOKEN: "your_preview_token_from_space_settings",
  GARCHI_SPACE_UID: "your_space_uid",
},
```

Where to find the values: API key → dashboard, Settings → API Keys. The key belongs
to the **account**, not to a space, and covers every space the account owns (up to five
keys per account), so the user may already have one. Space UID → dashboard, on the
space; this is what scopes a request to a space, not the key. Preview token → Space
Settings; this one **is per space**, and it enables rendering unpublished (`draft`)
content.

All of these are server-side only. None of them may be exposed to the browser
or committed to the repository.

## When to use a starter kit

Use one when **all** of these hold:

- The target directory is empty or the project has not been started.
- The framework is Next.js, Nuxt or Laravel.
- The user has no strong existing conventions to preserve.

## When not to use one

- An existing application, however small — integrate the SDK into it instead.
  A starter kit would overwrite conventions, routing and layout that already
  work.
- A framework not in the table — use the Node SDK, the PHP SDK, or the REST
  API directly from the server.
- The user asked only for content changes, not code.
- A monorepo or an app with an established design system — read the kit for
  its patterns, copy the ones you need, and leave the rest.

## What the kits give you

Every kit contains the same integration shape, which is also what you should
build by hand when integrating into an existing project:

1. A server-side Garchi client, constructed once from the API key.
2. A `getPage(slug, mode)` helper returning a page and its section tree.
3. A section renderer that resolves each section to a component by the
   section's `description` (falling back to `name`).
4. Example section components that forward unknown props to their root element
   so the Garchi Visual Editor keeps working.
5. HTML sanitisation before rendering rich text.

`garchi-render-content` documents each of these in detail, with code.
