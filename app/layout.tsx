import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/content/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Body and display are both Poppins, so it loads once; app/globals.css points
// --font-display at --font-body, leaving the seam in place if they diverge again.
const poppins = Poppins({
  subsets: ["latin"],
  // Poppins is not a variable font, so the weights the site uses are explicit.
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

// Code blocks and inline `code` in post bodies are the only monospace on the site.
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.intro,
  /*
   * `./` resolves against each route's own pathname, so every page gets its own
   * canonical and og:url from this one declaration. Leaving og:title/description
   * unset lets Next fill them from each page's title/description — a child that
   * declared its own `openGraph` would replace this block wholesale and lose the
   * generated opengraph-image along with it.
   */
  alternates: { canonical: "./" },
  openGraph: { type: "website", url: "./", siteName: site.name },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      // globals.css sets `scroll-behavior: smooth` for the home page's anchor
      // links; this opts back into Next suppressing it during route changes,
      // so a navigation still lands at the top instantly.
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string, no user data; must run before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SiteHeader />
        {/* Declared here, next to the skip link that targets it, so no route can forget it. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
