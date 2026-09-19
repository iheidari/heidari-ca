import { ArrowUpRightIcon } from "@/components/icons";
import PostMeta from "@/components/PostMeta";
import SmartLink from "@/components/SmartLink";
import type { Post } from "@/content/posts";
import styles from "./PostList.module.css";

type Props = {
  posts: readonly Post[];
  /** Depends on what sits above the list: `h2` on /blog, `h3` under a section. */
  headingLevel?: "h2" | "h3";
};

export default function PostList({ posts, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;

  return (
    <ul className={styles.list} role="list">
      {posts.map((post) => (
        <li key={post.slug}>
          <SmartLink
            className={styles.item}
            href={post.kind === "external" ? post.href : `/blog/${post.slug}`}
          >
            <PostMeta date={post.date} readingMinutes={post.readingMinutes} />

            <Heading className={styles.title}>
              {post.title}
              {post.kind === "external" ? (
                <ArrowUpRightIcon
                  className={styles.external}
                  width={16}
                  height={16}
                />
              ) : null}
            </Heading>

            <p className={styles.excerpt}>{post.excerpt}</p>
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
