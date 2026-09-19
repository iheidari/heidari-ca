import type { PostBlock } from "./blocks";
import { readingMinutes } from "./blocks";
import { placeSearch } from "./designing-place-search";
import { tieredLlmRouting } from "./tiered-llm-routing";

export type { PostBlock } from "./blocks";

type PostBase = {
  slug: string;
  title: string;
  /** Card copy and the route's meta description. */
  excerpt: string;
  date: string; // ISO date (YYYY-MM-DD)
};

/**
 * A post written here. `body` is the full article; `short` and `tldr` are
 * optional shorter editions of the same piece, and their presence is what
 * turns on the edition switch in `PostReader`.
 */
export type LocalSource = PostBase & {
  kind: "local";
  /** Standfirst under the title — one sentence, shared by every edition. */
  lead: string;
  /** Hero image, shared by every edition. Must exist under `public/`. */
  cover?: string;
  body: PostBlock[];
  short?: PostBlock[];
  tldr?: PostBlock[];
};

type ExternalPost = PostBase & {
  kind: "external";
  href: string;
  readingMinutes: number;
};

/** One reading edition of a post. `mode` doubles as its stylesheet class. */
export type Edition = {
  mode: "full" | "short" | "tldr";
  label: string;
  blocks: PostBlock[];
  readingMinutes: number;
};

export type EditionMode = Edition["mode"];

/**
 * A post either lives here (`local`, with a body) or somewhere else
 * (`external`, with a link). There is no third state, so no route ever has to
 * render an apology for a missing body.
 *
 * `editions` is built once here, longest first, and is never empty — `[0]` is
 * always the full article, which is where the card's reading time comes from.
 */
export type LocalPost = LocalSource & {
  editions: Edition[];
  readingMinutes: number;
};
export type Post = LocalPost | ExternalPost;

/**
 * The lead is a property of the post, not of any one edition, so it is counted
 * as part of every edition rather than left for each caller to remember.
 */
function buildEditions(source: LocalSource): Edition[] {
  const all: { mode: EditionMode; label: string; blocks?: PostBlock[] }[] = [
    { mode: "full", label: "Full", blocks: source.body },
    { mode: "short", label: "Short", blocks: source.short },
    { mode: "tldr", label: "tl;dr", blocks: source.tldr },
  ];

  return all.flatMap(({ mode, label, blocks }) =>
    blocks
      ? [
          {
            mode,
            label,
            blocks,
            readingMinutes: readingMinutes(source.lead, blocks),
          },
        ]
      : [],
  );
}

const entries: (LocalSource | ExternalPost)[] = [placeSearch, tieredLlmRouting];

/**
 * Newest first, sorted once: ordering is this module's job, not a caller's.
 * Local posts get their reading time measured here rather than hand-written,
 * so an edit to a body can't leave a stale number behind.
 */
export const posts: readonly Post[] = entries
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date))
  .map((post) => {
    if (post.kind !== "local") return post;

    const editions = buildEditions(post);
    return { ...post, editions, readingMinutes: editions[0].readingMinutes };
  });

/** Posts with a body here, i.e. the ones `/blog/[slug]` can render. */
export const localPosts: readonly LocalPost[] = posts.filter(
  (post): post is LocalPost => post.kind === "local",
);

const bySlug = new Map(localPosts.map((post) => [post.slug, post]));

export function findLocalPost(slug: string): LocalPost | undefined {
  return bySlug.get(slug);
}
