import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/app/blog/blog.module.css";
import PostMeta from "@/components/PostMeta";
import { findLocalPost, localPosts } from "@/content/posts";

export function generateStaticParams() {
  return localPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = findLocalPost(slug);

  return post
    ? { title: post.title, description: post.excerpt }
    : { title: "Post not found" };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = findLocalPost(slug);

  if (!post) notFound();

  return (
    <div className={styles.main}>
      <Link className={styles.back} href="/blog">
        ← All posts
      </Link>

      <article className={styles.article}>
        <h1 className={styles.title}>{post.title}</h1>
        <PostMeta
          date={post.date}
          readingTime={post.readingTime}
          month="long"
        />
        <p className={styles.body}>{post.body}</p>
      </article>
    </div>
  );
}
