import { readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";
import { site } from "@/content/site";
import { palette } from "@/lib/palette";

const size = { width: 1200, height: 630 };

// Satori reads woff, not woff2, so the card's one weight is committed as woff.
// Relative to the project root, where the build runs.
const fontPath = "src/assets/fonts/poppins-latin-400-normal.woff";

type Node = { type: string; props: Record<string, unknown> };

function div(style: Record<string, unknown>, children: unknown): Node {
  return {
    type: "div",
    props: { style: { display: "flex", ...style }, children },
  };
}

// Rendered at build time; also used as the Twitter card image.
export const GET: APIRoute = async () => {
  const card = div(
    {
      // Satori's root has no sized parent to resolve `100%` against, and its
      // boxes are content-box, so the padding would push the card past 630px.
      ...size,
      boxSizing: "border-box",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 80,
      background: palette.dark.background,
      color: palette.dark.foreground,
    },
    [
      div(
        { fontSize: 30, color: palette.dark.mutedForeground },
        new URL(import.meta.env.SITE).host,
      ),
      div({ flexDirection: "column", gap: 24 }, [
        div(
          { fontSize: 68, lineHeight: 1.1, textWrap: "balance" },
          site.tagline,
        ),
        div(
          { fontSize: 34, color: palette.dark.accent },
          `${site.name} · ${site.role}`,
        ),
      ]),
    ],
  );

  const svg = await satori(card, {
    ...size,
    fonts: [
      {
        name: "Poppins",
        data: await readFile(fontPath),
        weight: 400,
        style: "normal",
      },
    ],
  });
  const png = new Resvg(svg).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
