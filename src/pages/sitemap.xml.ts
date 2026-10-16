import type { APIRoute } from "astro";
import { localPosts } from "@/content/posts";
import { postDate } from "@/lib/date";
import { absoluteUrl } from "@/lib/url";

type Entry = { url: string; lastModified?: Date; priority: number };

export const GET: APIRoute = () => {
  const entries: Entry[] = [
    { url: absoluteUrl("/"), priority: 1 },
    { url: absoluteUrl("/blog"), priority: 0.8 },
    ...localPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: postDate(post.date),
      priority: 0.6,
    })),
  ];

  // URLs come from site config and post slugs, so nothing needs XML escaping.
  const urls = entries.map(
    ({ url, lastModified, priority }) =>
      `<url>\n<loc>${url}</loc>\n${
        lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>\n` : ""
      }<priority>${priority}</priority>\n</url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
