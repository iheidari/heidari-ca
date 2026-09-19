import SocialLinks from "@/components/SocialLinks";
import { site } from "@/content/site";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* No year: these pages are static, so a build-time year goes stale. */}
        <p className={styles.copy}>© {site.name}. Built with Next.js.</p>
        <SocialLinks size="sm" />
      </div>
    </footer>
  );
}
