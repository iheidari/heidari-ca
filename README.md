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
- `content/projects.ts` — portfolio entries (title, summary, year, tags, optional repo/live links)
- `content/posts.ts` — blog posts, exported pre-sorted (newest first) alongside `localPosts()`/`findLocalPost()`, so no route re-sorts or re-scans

A post is either `kind: "local"` with a `body`, or `kind: "external"` with an
`href` — there is no bodyless state, so `/blog/[slug]` never renders a
placeholder. `content/posts.ts` ships empty; add real posts, or swap the route
for MDX/a CMS when there is long-form content to publish.

> **Before going live:** `content/projects.ts` still contains three placeholder
> entries ("Project One/Two/Three"). Replace them with real work.

## Theming

Light/dark is driven by a `data-theme` attribute on `<html>`:

- Design tokens (color, spacing, radius, type scale, control size, motion) live in `app/globals.css`
- `components/recipes.module.css` holds the shared control/button/surface/chip recipes; component stylesheets pull them in with `composes:`
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
lib/          theme helpers, date formatting
```

Imports use the `@/*` alias (`@/components/…`, `@/content/…`, `@/lib/…`) rather
than relative paths.
