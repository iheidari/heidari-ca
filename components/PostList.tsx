import { ArrowUpRightIcon } from "@/components/icons";
import PostMeta from "@/components/PostMeta";
import SmartLink from "@/components/SmartLink";
import type { Post } from "@/content/posts";
import styles from "./PostList.module.css";

export default function PostList({ posts }: { posts: readonly Post[] }) {
  return (
    <ul className={styles.list} role="list">
      {posts.map((post) => (
        <li key={post.slug}>
          <SmartLink
            className={styles.item}
            href={post.kind === "external" ? post.href : `/blog/${post.slug}`}
          >
            <PostMeta date={post.date} readingTime={post.readingTime} />

            <h3 className={styles.title}>
              {post.title}
              {post.kind === "external" ? (
                <ArrowUpRightIcon
                  className={styles.external}
                  width={16}
                  height={16}
                />
              ) : null}
            </h3>

            <p className={styles.excerpt}>{post.excerpt}</p>
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
