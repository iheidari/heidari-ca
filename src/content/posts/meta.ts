/**
 * Slug and date of each post, apart from the bodies so astro.config.mjs can
 * read them for the sitemap's `lastmod` without loading the bodies' image
 * imports, which only resolve inside the Astro build.
 *
 * `index.ts` checks that `postMeta` holds exactly the local posts, so a post
 * left out here fails the build instead of silently losing its `lastmod`.
 */
export type PostMeta = {
  slug: string;
  date: string; // ISO date (YYYY-MM-DD)
};

/** Keyed by the post's export name; each post file spreads its own entry. */
export const postMeta = {
  placeSearch: {
    slug: "designing-place-search-geonames",
    date: "2026-09-09",
  },
  tieredLlmRouting: {
    slug: "benchmarking-12-llms-tiered-routing",
    date: "2026-09-10",
  },
  tryingJev: {
    slug: "trying-jev-for-natural-language-search",
    date: "2026-10-01",
  },
  smallLlmComparison: {
    slug: "nine-small-llms-for-natural-language-search",
    date: "2026-10-09",
  },
} satisfies Record<string, PostMeta>;
