import { site } from "@/content/site";

/** Absolute URL for crawler-facing files (robots, sitemap) that need an origin. */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}
