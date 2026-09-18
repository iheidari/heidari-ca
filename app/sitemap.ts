import type { MetadataRoute } from "next";
import { localPosts } from "@/content/posts";
import { postDate } from "@/lib/date";
import { absoluteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), priority: 1 },
    { url: absoluteUrl("/blog"), priority: 0.8 },
    ...localPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: postDate(post.date),
      priority: 0.6,
    })),
  ];
}
