import { ArrowUpRightIcon, GithubIcon } from "@/components/icons";
import SmartLink from "@/components/SmartLink";
import type { Project } from "@/content/projects";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({ project }: { project: Project }) {
  const links = [
    project.live
      ? { href: project.live, label: "Live site", trailing: true }
      : null,
    project.repo
      ? { href: project.repo, label: "Source", trailing: false }
      : null,
  ].filter((link) => link !== null);

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <h3 className={styles.title}>{project.title}</h3>
        <span className={styles.year}>{project.year}</span>
      </header>

      <p className={styles.summary}>{project.summary}</p>

      <ul className={styles.tags} role="list">
        {project.tags.map((tag) => (
          <li key={tag} className={styles.tag}>
            {tag}
          </li>
        ))}
      </ul>

      {links.length > 0 ? (
        <footer className={styles.links}>
          {links.map(({ href, label, trailing }) => (
            <SmartLink key={href} className={styles.link} href={href}>
              {trailing ? null : <GithubIcon width={16} height={16} />}
              {label}
              {trailing ? <ArrowUpRightIcon width={16} height={16} /> : null}
            </SmartLink>
          ))}
        </footer>
      ) : null}
    </article>
  );
}
