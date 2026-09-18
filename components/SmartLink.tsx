import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"a"> & { href: string };

/** Schemes an authored `[label](href)` may use, and how each one opens. */
const OUTBOUND = [
  { scheme: "https:", newTab: true },
  { scheme: "http:", newTab: true },
  { scheme: "mailto:", newTab: false },
];

/**
 * The one place that decides internal vs. external. Internal hrefs get
 * client-side navigation; allowed outbound schemes get a plain anchor, and
 * outbound http(s) links always carry `rel="noreferrer noopener"`.
 *
 * Anything else — an unknown scheme, or a protocol-relative `//host` that would
 * leave the site through `next/link` without `noopener` — renders as plain text
 * rather than a link.
 */
export default function SmartLink({ href, children, ...props }: Props) {
  if (
    href.startsWith("#") ||
    (href.startsWith("/") && !href.startsWith("//"))
  ) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  const allowed = OUTBOUND.find(({ scheme }) => href.startsWith(scheme));
  if (!allowed) return <>{children}</>;

  return (
    <a
      href={href}
      {...(allowed.newTab
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      {...props}
    >
      {children}
    </a>
  );
}
