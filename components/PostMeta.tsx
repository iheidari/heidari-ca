import { formatPostDate } from "@/lib/date";
import styles from "./PostMeta.module.css";

type Props = {
  date: string;
  readingTime: string;
  month?: "short" | "long";
};

export default function PostMeta({ date, readingTime, month }: Props) {
  return (
    <div className={styles.meta}>
      <time dateTime={date}>{formatPostDate(date, month)}</time>
      <span aria-hidden="true">·</span>
      <span>{readingTime}</span>
    </div>
  );
}
