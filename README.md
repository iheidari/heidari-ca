# heidari.ca

Personal site and portfolio for Iman Heidari — built with Next.js (App Router), React Server Components, and CSS Modules. No UI framework, no runtime dependencies beyond Next/React.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm format       # Biome, writes
pnpm lint         # Biome check + ESLint
pnpm typecheck    # next typegen + tsc --noEmit
```

`pnpm typecheck` runs `next typegen` first because the route helper types
(`PageProps<…>`, `LayoutProps<…>`) are generated into the gitignored `.next/`
directory. On a fresh clone, run it once before trusting the editor.

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, and build on
every pull request.

## Editing content

Copy that changes often lives in plain TypeScript files — no CMS needed:

- `content/site.ts` — name, role, tagline, intro, email, socials, tech stack, availability badge, and the section headings/leads used on the home and blog pages
- `content/projects.ts` — portfolio entries (title, summary, year, tags, optional repo/live/App Store/Google Play links)
- `content/posts/` — one file per post, collected in `index.ts` and exported pre-sorted (newest first) alongside `localPosts`/`findLocalPost()`, so no route re-sorts or re-scans

A post is either `kind: "local"` with a `body`, or `kind: "external"` with an
`href` — there is no bodyless state, so `/blog/[slug]` never renders a
placeholder. Reading time is measured from the body at build time and travels as
a number of minutes; `lib/reading.ts` is the only place that turns it into words.

### Post bodies

A body is an array of `PostBlock`s (`content/posts/blocks.ts`), not markdown —
`paragraph`, `heading`, `list`, `quote`, `image`, `code`, `callout`. Each maps to
exactly one surface `components/PostBody.tsx` knows how to render, so a post
can't reach for styling the site doesn't have. Inside any `text` or list item the
entire inline vocabulary is `[label](href)`, `**bold**`, `*emphasis*`, and
`` `code` ``; anything else stays literal text.

### Editions

Alongside `body`, a post may ship `short` and `tldr` block arrays. Their presence
is what turns on the full / short / tl;dr switch in `components/PostReader.tsx`;
a post with neither renders its body alone. All editions ship in the HTML and the
switch is a radio group revealed by `:has(:checked)` rules, so it stays a server
component and works with JavaScript off — the tradeoff is payload: a post with
all three editions sends roughly 35% more HTML than its full text alone, and
every reader pays for editions most will never open. The editions are independently written
condensations, not subsets — a corrected fact has to be corrected in each one.

Adding a mode means adding it to `EDITIONS` in `content/posts/index.ts`, to the
`PANEL` record in `PostReader.tsx`, and to the reveal rule in
`PostReader.module.css`; the record is typed against the mode union so a missing
class fails typecheck rather than rendering a blank article.

## Theming

Light/dark is driven by a `data-theme` attribute on `<html>`:

- Design tokens (color, spacing, radius, type scale, control size, motion) live in `app/globals.css`
- `components/recipes.module.css` holds the shared control/button/surface/chip recipes; component stylesheets pull them in with `composes:`
  - Keep `composes:` chains to two hops. At three (consumer → `buttonPrimary` → `button` → `control`) the compiler drops the last class from the emitted list, silently un-styling the element.
- `lib/theme.ts` holds the inline script that applies the stored or system theme before first paint
- `components/ThemeToggle.tsx` flips the attribute and persists the choice to `localStorage`

Page metadata is declared once, in `app/layout.tsx`, using relative `./` URLs —
they resolve against each route's own path, so every page gets its own canonical
and `og:url` for free. Routes set only `title` and `description`; Next fills the
Open Graph fields from those. Don't add an `openGraph` block to a child route:
it replaces the parent's wholesale and drops the generated `app/opengraph-image`.

## Structure

```
app/          routes, layout, global tokens, robots/sitemap/OG image
components/   header, footer, cards, icons, theme toggle, SmartLink
content/      site copy, projects, posts
lib/          theme helpers, date and reading-time formatting, URL helpers
```

Imports use the `@/*` alias (`@/components/…`, `@/content/…`, `@/lib/…`) rather
than relative paths.
