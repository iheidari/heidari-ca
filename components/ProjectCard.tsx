import { ArrowUpRightIcon, GithubIcon } from "@/components/icons";
import SmartLink from "@/components/SmartLink";
import type { Project } from "@/content/projects";
import styles from "./ProjectCard.module.css";

/**
 * Which optional fields of a `Project` become footer links, in display order.
 * One row per link, so adding a destination is a row rather than a branch, and
 * `satisfies` makes a mistyped field name a typecheck error.
 */
const LINKS = [
  { field: "live", label: "Live site", Icon: ArrowUpRightIcon, side: "end" },
  {
    field: "appStore",
    label: "App Store",
    Icon: ArrowUpRightIcon,
    side: "end",
  },
  {
    field: "googlePlay",
    label: "Google Play",
    Icon: ArrowUpRightIcon,
    side: "end",
  },
  { field: "repo", label: "Source", Icon: GithubIcon, side: "start" },
] as const satisfies readonly {
  field: keyof Project;
  label: string;
  Icon: typeof ArrowUpRightIcon;
  side: "start" | "end";
}[];

export default function ProjectCard({ project }: { project: Project }) {
  const links = LINKS.flatMap(({ field, label, Icon, side }) => {
    const href = project[field];
    return typeof href === "string" ? [{ href, label, Icon, side }] : [];
  });

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <h3 className={styles.title}>{project.title}</h3>
        {project.year ? (
          <span className={styles.year}>{project.year}</span>
        ) : null}
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
          {links.map(({ href, label, Icon, side }) => (
            <SmartLink key={href} className={styles.link} href={href}>
              {side === "start" ? <Icon width={16} height={16} /> : null}
              {label}
              {side === "end" ? <Icon width={16} height={16} /> : null}
            </SmartLink>
          ))}
        </footer>
      ) : null}
    </article>
  );
}
