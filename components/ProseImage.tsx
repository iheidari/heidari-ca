import Image from "next/image";

/**
 * Every image that renders inside the prose column: post covers and in-body
 * figures. It owns the three things both call sites otherwise restate — the
 * 16:9 intrinsic size, the `sizes` hint, and the framed styling.
 *
 * `sizes` is full-bleed below the breakpoint and capped at the column width
 * above it; the 800px matches `--content-width-prose` in `app/globals.css`.
 */
const SIZES = "(max-width: 880px) 100vw, 800px";

type Props = {
  src: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
  preload?: boolean;
};

export default function ProseImage({
  src,
  alt,
  className,
  width = 1600,
  height = 900,
  preload = false,
}: Props) {
  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={SIZES}
      preload={preload}
    />
  );
}
