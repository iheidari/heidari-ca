import type { ReactNode } from "react";
import ProseImage from "@/components/ProseImage";
import SmartLink from "@/components/SmartLink";
import type { PostBlock } from "@/content/posts";
import styles from "./PostBody.module.css";

/**
 * `[label](href)` · `**bold**` · `*emphasis*` · `` `code` `` — the whole inline
 * vocabulary. `**bold**` is listed before `*emphasis*` so a bold run is never
 * mis-read as emphasis wrapping a stray asterisk.
 */
const INLINE =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`]+)`/g;

/** Turns a block's text into nodes. Anything unmatched stays plain text. */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE)) {
    const [full, label, href, bold, emphasis, code] = match;
    const at = match.index;
    if (at > cursor) nodes.push(text.slice(cursor, at));

    if (href) {
      nodes.push(
        <SmartLink key={at} className={styles.link} href={href}>
          {label}
        </SmartLink>,
      );
    } else if (bold) {
      nodes.push(<strong key={at}>{bold}</strong>);
    } else if (emphasis) {
      nodes.push(<em key={at}>{emphasis}</em>);
    } else {
      nodes.push(
        <code key={at} className={styles.code}>
          {code}
        </code>,
      );
    }

    cursor = at + full.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function Block({ block, lead }: { block: PostBlock; lead: boolean }) {
  switch (block.type) {
    case "heading":
      return <h2 className={styles.heading}>{block.text}</h2>;

    case "paragraph":
      return (
        <p className={lead ? styles.leadParagraph : styles.paragraph}>
          {inline(block.text)}
        </p>
      );

    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{inline(item)}</li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className={styles.quote}>
          <p>{inline(block.text)}</p>
          {block.attribution ? (
            <footer className={styles.attribution}>
              — {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );

    case "image":
      return (
        <figure className={styles.figure}>
          <ProseImage
            className={styles.image}
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
          />
          {block.caption ? (
            <figcaption className={styles.caption}>{block.caption}</figcaption>
          ) : null}
        </figure>
      );

    case "code":
      return (
        <div className={styles.terminal}>
          {block.title ? (
            <p className={styles.terminalTitle}>{block.title}</p>
          ) : null}
          {/* One entry per line, joined here so it copies as real text. */}
          <pre className={styles.pre}>
            <code>{block.lines.join("\n")}</code>
          </pre>
        </div>
      );

    case "callout":
      return (
        <aside className={styles.callout}>
          {block.title ? (
            <p className={styles.calloutTitle}>{block.title}</p>
          ) : null}
          <p>{inline(block.text)}</p>
          {block.href ? (
            <SmartLink className={styles.calloutLink} href={block.href}>
              {block.linkLabel ?? "Read more"} →
            </SmartLink>
          ) : null}
        </aside>
      );
  }
}

/** Renders one edition of a post from its block array. */
export default function PostBody({ blocks }: { blocks: readonly PostBlock[] }) {
  // The opening paragraph renders one step larger, wherever it falls.
  const lead = blocks.findIndex((block) => block.type === "paragraph");

  return (
    <div className={styles.body}>
      {blocks.map((block, index) => (
        // Blocks have no stable id and never reorder, so the index is the key.
        // biome-ignore lint/suspicious/noArrayIndexKey: static, never-reordered content
        <Block key={index} block={block} lead={index === lead} />
      ))}
    </div>
  );
}
