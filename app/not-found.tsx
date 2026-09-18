import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.main}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>This page does not exist</h1>
      <p className={styles.lead}>
        The link may be out of date, or the page may have moved.
      </p>
      <Link className={styles.action} href="/">
        Back to home
      </Link>
    </div>
  );
}
