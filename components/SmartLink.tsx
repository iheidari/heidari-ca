import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"a"> & { href: string };

/**
 * The one place that decides internal vs. external. Internal hrefs get
 * client-side navigation; everything else (including `mailto:`) gets a plain
 * anchor, and outbound http(s) links always carry `rel="noreferrer noopener"`.
 */
export default function SmartLink({ href, children, ...props }: Props) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  const outbound = href.startsWith("http");

  return (
    <a
      href={href}
      {...(outbound ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
