import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { palette } from "@/lib/palette";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.role}`;

// Rendered at build time; also used as the Twitter card image.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: palette.dark.background,
        color: palette.dark.foreground,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          color: palette.dark.mutedForeground,
        }}
      >
        {site.url.replace("https://", "")}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.1 }}>
          {site.tagline}
        </div>
        <div
          style={{ display: "flex", fontSize: 34, color: palette.dark.accent }}
        >
          {site.name} · {site.role}
        </div>
      </div>
    </div>,
    size,
  );
}
