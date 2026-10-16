import type { APIRoute } from "astro";
import { absoluteUrl } from "@/lib/url";

export const GET: APIRoute = () =>
  new Response(
    `User-Agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap-index.xml")}\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
