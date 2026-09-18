import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MailIcon } from "@/components/icons";
import PostList from "@/components/PostList";
import ProjectCard from "@/components/ProjectCard";
import SmartLink from "@/components/SmartLink";
import SocialLinks from "@/components/SocialLinks";
import { posts } from "@/content/posts";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import avatar from "@/public/avatar.jpg";
import styles from "./page.module.css";

export default function Home() {
  const latestPosts = posts.slice(0, 3);
  const { work, writing, contact } = site.sections;
  const mailto = `mailto:${site.email}`;

  return (
    <div className={styles.main}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          {site.available ? (
            <p className={styles.badge}>
              <span className={styles.dot} aria-hidden="true" />
              Available for new work
            </p>
          ) : null}

          <h1 id="hero-title" className={styles.heroTitle}>
            {site.tagline}
          </h1>

          <p className={styles.heroIntro}>{site.intro}</p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="#work">
              See my work
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <SmartLink className={styles.secondaryAction} href={mailto}>
              <MailIcon width={18} height={18} />
              Get in touch
            </SmartLink>
          </div>

          <SocialLinks />
        </div>

        <div className={styles.heroCard}>
          <Image
            className={styles.avatar}
            src={avatar}
            alt={`Portrait of ${site.name}`}
            width={112}
            height={112}
            preload
          />
          <p className={styles.heroName}>{site.name}</p>
          <p className={styles.heroRole}>
            {site.role} · {site.location}
          </p>
          <ul className={styles.stack} role="list">
            {site.stack.map((item) => (
              <li key={item} className={styles.stackItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="work"
        className={styles.section}
        aria-labelledby="work-title"
      >
        <header className={styles.sectionHead}>
          <h2 id="work-title" className={styles.sectionTitle}>
            {work.title}
          </h2>
          <p className={styles.sectionLead}>{work.lead}</p>
        </header>

        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section
          id="writing"
          className={styles.section}
          aria-labelledby="writing-title"
        >
          <header className={styles.sectionHead}>
            <h2 id="writing-title" className={styles.sectionTitle}>
              {writing.title}
            </h2>
            <p className={styles.sectionLead}>{writing.lead}</p>
          </header>

          <PostList posts={latestPosts} />

          <Link className={styles.moreLink} href="/blog">
            All posts
            <ArrowRightIcon width={18} height={18} />
          </Link>
        </section>
      ) : null}

      <section
        id="contact"
        className={styles.contact}
        aria-labelledby="contact-title"
      >
        <h2 id="contact-title" className={styles.contactTitle}>
          {contact.title}
        </h2>
        <p className={styles.contactLead}>{contact.lead}</p>
        <div className={styles.actions}>
          <SmartLink className={styles.primaryAction} href={mailto}>
            <MailIcon width={18} height={18} />
            {site.email}
          </SmartLink>
          <SmartLink
            className={styles.secondaryAction}
            href={site.socials.linkedin}
          >
            Connect on LinkedIn
          </SmartLink>
        </div>
      </section>
    </div>
  );
}
