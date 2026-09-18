import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/app/blog/blog.module.css";
import PostMeta from "@/components/PostMeta";
import PostReader from "@/components/PostReader";
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
        <p className={styles.postLead}>{post.lead}</p>

        {post.cover ? (
          <Image
            className={styles.cover}
            src={post.cover}
            alt=""
            width={1600}
            height={900}
            sizes="(max-width: 880px) 100vw, 800px"
            priority
          />
        ) : null}

        <PostReader post={post} />
      </article>
    </div>
  );
}
