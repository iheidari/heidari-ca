/**
 * Absolute URL on the configured `site` origin. The trailing slash is dropped
 * so `/` here matches the home page's own canonical, which the
 * `trailingSlash: "never"` build emits without one.
 */
export function absoluteUrl(path: string) {
  return new URL(path, import.meta.env.SITE).toString().replace(/\/$/, "");
}

/**
 * Public URL of a built page. `build.format: "file"` puts `.html` on the
 * build-time pathname; the served URL has neither that nor a trailing slash.
 */
export function canonicalUrl(pathname: string) {
  return absoluteUrl(pathname.replace(/(\/index)?\.html$/, ""));
}
