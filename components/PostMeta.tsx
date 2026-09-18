import { formatPostDate } from "@/lib/date";
import { formatReadingTime } from "@/lib/reading";
import styles from "./PostMeta.module.css";

type Props = {
  date: string;
  readingMinutes: number;
  /** Date format: `Jan 5, 2026` or `January 5, 2026`. */
  dateStyle?: "short" | "long";
};

export default function PostMeta({ date, readingMinutes, dateStyle }: Props) {
  return (
    <div className={styles.meta}>
      <time dateTime={date}>{formatPostDate(date, dateStyle)}</time>
      <span aria-hidden="true">·</span>
      <span>{formatReadingTime(readingMinutes)}</span>
    </div>
  );
}
