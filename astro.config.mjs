import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { postMeta } from "./src/content/posts/meta.ts";
import { postDate } from "./src/lib/date.ts";

// Sitemap `lastmod` per post path; other pages have no meaningful date.
// Built here, not in `serialize`, whose errors the integration swallows.
const postLastmod = new Map(
  Object.values(postMeta).map(({ slug, date }) => [
    `/blog/${slug}`,
    postDate(date).toISOString(),
  ]),
);

export default defineConfig({
  site: "https://heidari.ca",
  // `/blog` and `/blog/slug`, never `/blog/` — the URLs the Next build served,
  // and the form the sitemap and canonicals use.
  trailingSlash: "never",
  // The site's CSS is a few KB; inlining it removes render-blocking requests.
  build: { format: "file", inlineStylesheets: "always" },
  // tsconfig's `@/*` only reaches JS imports; CSS-module `composes` needs it here.
  vite: {
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  },
  fonts: [
    {
      // Body and display are both Poppins, so it loads once; globals.css points
      // --font-display at --font-body, leaving the seam in place if they diverge.
      provider: fontProviders.google(),
      name: "Poppins",
      cssVariable: "--font-body",
      // Poppins is not a variable font, so the weights the site uses are explicit.
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: ["100 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
  integrations: [
    sitemap({
      serialize: (item) => ({
        ...item,
        lastmod: postLastmod.get(new URL(item.url).pathname),
      }),
    }),
  ],
});
