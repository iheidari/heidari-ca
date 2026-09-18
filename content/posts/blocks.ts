/**
 * A post body is an array of blocks, not a markdown blob — every block maps to
 * exactly one surface `PostBody` knows how to render, so a post can't reach
 * for styling the site doesn't have.
 *
 * Inside any `text` or list item the whole inline vocabulary is
 * `[label](href)`, `**bold**`, and `` `code` ``.
 */
export type PostBlock =
  /** Body paragraph. The first paragraph of an edition renders one step larger. */
  | { type: "paragraph"; text: string }
  /** Section heading, rendered as an `h2`. */
  | { type: "heading"; text: string }
  /** Bulleted list. */
  | { type: "list"; items: string[] }
  /** Pull quote with an optional attribution line. */
  | { type: "quote"; text: string; attribution?: string }
  /** Figure. `src` must exist under `public/`, e.g. `/images/blog/foo/bar.png`. */
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    }
  /** Preformatted block — one array entry per line, no syntax highlighting. */
  | { type: "code"; lines: string[]; title?: string }
  /** Tinted aside; add `href` + `linkLabel` for a call to action. */
  | {
      type: "callout";
      text: string;
      title?: string;
      href?: string;
      linkLabel?: string;
    };

/** Every word a block contributes, for counting. */
function words(block: PostBlock): string {
  switch (block.type) {
    case "list":
      return block.items.join(" ");
    case "code":
      return block.lines.join(" ");
    case "image":
      return block.caption ?? "";
    default:
      return block.text;
  }
}

const WORDS_PER_MINUTE = 200;

/** Rough read time for one edition — "4 min read". */
export function readingTime(lead: string, blocks: PostBlock[]): string {
  const count = [lead, ...blocks.map(words)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.round(count / WORDS_PER_MINUTE))} min read`;
}
