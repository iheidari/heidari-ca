type PostBase = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date (YYYY-MM-DD)
  readingTime: string;
};

/**
 * A post either lives here (`local`, with a body) or somewhere else
 * (`external`, with a link). There is no third state, so no route ever has to
 * render an apology for a missing body.
 */
export type Post = PostBase &
  ({ kind: "local"; body: string } | { kind: "external"; href: string });

type LocalPost = Extract<Post, { kind: "local" }>;

// Add real posts here, or swap this file for MDX/a CMS later.
const entries: Post[] = [];

/** Newest first, sorted once: ordering is this module's job, not a caller's. */
export const posts: readonly Post[] = [...entries].sort((a, b) =>
  b.date.localeCompare(a.date),
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
