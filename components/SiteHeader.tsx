import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/content/site";
import styles from "./SiteHeader.module.css";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            {site.initials}
          </span>
          <span className={styles.brandName}>{site.name}</span>
        </Link>

        <nav aria-label="Main">
          <ul className={styles.navList} role="list">
            {links.map((link) => (
              <li key={link.href}>
                <Link className={styles.navLink} href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
