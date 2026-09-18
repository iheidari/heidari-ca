export type { PostBlock } from "./blocks";

import type { PostBlock } from "./blocks";
import { readingTime } from "./blocks";
import { placeSearch } from "./designing-place-search";
import { tieredLlmRouting } from "./tiered-llm-routing";

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
  readingTime: string;
};

/**
 * A post either lives here (`local`, with a body) or somewhere else
 * (`external`, with a link). There is no third state, so no route ever has to
 * render an apology for a missing body.
 */
export type LocalPost = LocalSource & { readingTime: string };
export type Post = LocalPost | ExternalPost;

const entries: (LocalSource | ExternalPost)[] = [placeSearch, tieredLlmRouting];

/**
 * Newest first, sorted once: ordering is this module's job, not a caller's.
 * Local posts get their reading time measured here rather than hand-written,
 * so an edit to a body can't leave a stale number behind.
 */
export const posts: readonly Post[] = [...entries]
  .sort((a, b) => b.date.localeCompare(a.date))
  .map((post) =>
    post.kind === "local"
      ? { ...post, readingTime: readingTime(post.lead, post.body) }
      : post,
  );

const local = posts.filter((post): post is LocalPost => post.kind === "local");
const bySlug = new Map(local.map((post) => [post.slug, post]));

/** Posts with a body here, i.e. the ones `/blog/[slug]` can render. */
export function localPosts(): readonly LocalPost[] {
  return local;
}

export function findLocalPost(slug: string): LocalPost | undefined {
  return bySlug.get(slug);
}

/** The reading editions of a post, longest first. Only `full` is guaranteed. */
const EDITIONS = [
  { mode: "full", label: "Full", of: (post: LocalPost) => post.body },
  { mode: "short", label: "Short", of: (post: LocalPost) => post.short },
  { mode: "tldr", label: "tl;dr", of: (post: LocalPost) => post.tldr },
] as const;

export type Edition = {
  mode: (typeof EDITIONS)[number]["mode"];
  label: string;
  blocks: PostBlock[];
  readingTime: string;
};

/**
 * The editions a post actually ships, longest first. A post with no `short` or
 * `tldr` yields a single entry, which is what tells `PostReader` to skip the
 * switch entirely.
 */
export function editions(post: LocalPost): Edition[] {
  return EDITIONS.flatMap(({ mode, label, of }) => {
    const blocks = of(post);
    return blocks
      ? [{ mode, label, blocks, readingTime: readingTime(post.lead, blocks) }]
      : [];
  });
}
