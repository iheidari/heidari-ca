import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { posts } from "@/content/posts";
import { site } from "@/content/site";
import styles from "./blog.module.css";

const { title, lead } = site.sections.writing;

export const metadata: Metadata = { title, description: lead };

export default function BlogIndex() {
  return (
    <div className={styles.main}>
      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </header>

      {posts.length > 0 ? (
        <PostList posts={posts} headingLevel="h2" />
      ) : (
        <p className={styles.empty}>No posts yet. First one is on its way.</p>
      )}
    </div>
  );
}
