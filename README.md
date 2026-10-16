# heidari.ca

Personal site and portfolio for Iman Heidari — a fully static Astro site with CSS Modules. No UI framework, no client-side JavaScript beyond the theme toggle.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static output in dist/
pnpm preview      # serves dist/ via wrangler dev, same routing as production
pnpm run deploy   # build + wrangler deploy (bare `pnpm deploy` is a pnpm built-in)
pnpm format       # Biome, writes
pnpm lint         # Biome check
pnpm typecheck    # astro check
```

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, and build on
every pull request, and on push to `main` also deploys to Cloudflare (needs the
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets).

## Deploy

Hosted on Cloudflare Workers as a static-assets-only Worker (`wrangler.jsonc`), no
adapter, on the `heidari.ca` custom domain (`www` redirects to it via a
Cloudflare Redirect Rule). `html_handling: "drop-trailing-slash"` mirrors Astro's
`trailingSlash: "never"`; redirects live in `public/_redirects`.

## Editing content

Copy that changes often lives in plain TypeScript files — no CMS needed:

- `src/content/site.ts` — name, role, tagline, intro, email, socials, tech stack, availability badge, and the section headings/leads used on the home and blog pages
- `src/content/projects.ts` — portfolio entries (title, summary, year, tags, optional repo/live/App Store/Google Play links)
- `src/content/posts/` — one file per post, collected in `index.ts` and exported pre-sorted (newest first) alongside `localPosts`, so no route re-sorts or re-scans. Each post's slug and date live in `meta.ts` (keyed in `postMeta`), which the sitemap reads for `lastmod`; `index.ts` fails the build if `postMeta` and the local posts drift apart

A post is either `kind: "local"` with a `body`, or `kind: "external"` with an
`href` — there is no bodyless state, so `/blog/[slug]` never renders a
placeholder. Reading time is measured from the body at build time and travels as
a number of minutes.

### Post bodies

A body is an array of `PostBlock`s (`src/content/posts/blocks.ts`), not markdown —
`paragraph`, `heading`, `list`, `quote`, `image`, `code`, `callout`. Each maps to
exactly one surface `src/components/PostBody.astro` knows how to render, so a post
can't reach for styling the site doesn't have. Inside any `text` or list item the
entire inline vocabulary is `[label](href)`, `**bold**`, `*emphasis*`, and
`` `code` ``; anything else stays literal text.

### Editions

Alongside `body`, a post may ship `short` and `tldr` block arrays. Their presence
is what turns on the full / short / tl;dr switch in `src/components/PostReader.astro`;
a post with neither renders its body alone. All editions ship in the HTML and the
switch is a radio group revealed by `:has(:checked)` rules, so it needs no client
script and works with JavaScript off — the tradeoff is payload: a post with
all three editions sends roughly 35% more HTML than its full text alone, and
every reader pays for editions most will never open. The editions are independently written
condensations, not subsets — a corrected fact has to be corrected in each one.

Adding a mode means adding it to `EDITIONS` in `src/content/posts/index.ts`, to the
`PANEL` record in `PostReader.astro`, and to the reveal rule in
`PostReader.module.css`; the record is typed against the mode union so a missing
class fails typecheck rather than rendering a blank article.

## Theming

Light/dark is driven by a `data-theme` attribute on `<html>`:

- Design tokens (color, spacing, radius, type scale, control size, motion) live in `src/styles/globals.css`
- `src/components/recipes.module.css` holds the shared control/button/surface/chip recipes; component stylesheets pull them in with `composes:`
  - Keep `composes:` chains to two hops. At three (consumer → `buttonPrimary` → `button` → `control`) the compiler drops the last class from the emitted list, silently un-styling the element.
- `src/lib/theme.ts` holds the inline script that applies the stored or system theme before first paint
- `src/components/ThemeToggle.astro` flips the attribute and persists the choice to `localStorage`

Page metadata is declared once, in `src/layouts/BaseLayout.astro`: routes pass
only `title` and `description`, and the layout derives the canonical, `og:url`,
and Open Graph fields from those and the page's own path. The share card is
`src/pages/opengraph-image.png.ts`, rendered to a PNG at build time with satori.

## Structure

```
src/pages/       routes, robots/OG image endpoints (sitemap: @astrojs/sitemap)
src/layouts/     base layout and page metadata
src/components/  header, footer, cards, icons, theme toggle, SmartLink
src/content/     site copy, projects, posts
src/lib/         theme helpers, date formatting, URL helpers
src/styles/      global tokens and page stylesheets
```

Imports use the `@/*` alias (`@/components/…`, `@/content/…`, `@/lib/…`) rather
than relative paths.
