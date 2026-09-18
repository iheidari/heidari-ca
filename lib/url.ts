import { site } from "@/content/site";

/**
 * Absolute URL for crawler-facing files (robots, sitemap) that need an origin.
 * The trailing slash is dropped so `/` here matches the home page's own
 * canonical, which Next emits without one.
 */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString().replace(/\/$/, "");
}
