import { Fragment } from "react";
import PostBody from "@/components/PostBody";
import type { EditionMode, LocalPost } from "@/content/posts";
import styles from "./PostReader.module.css";

/**
 * One class per edition: the stylesheet needs a selector per mode to reveal the
 * checked panel. Typed as a total record so a mode added without its rule fails
 * typecheck instead of rendering a blank article.
 */
const PANEL: Record<EditionMode, string> = {
  full: styles.full,
  short: styles.short,
  tldr: styles.tldr,
};

/**
 * A post body with a full / short / tl;dr switch.
 *
 * The switch is a radio group and the panels are revealed by `:has(:checked)`
 * rules in the stylesheet, so this stays a server component and switching
 * works with JavaScript off. Where `:has` is unsupported the editions simply
 * stack — degraded, but nothing is lost. A post that ships only a full body
 * renders the body alone, with no switch.
 */
export default function PostReader({ post }: { post: LocalPost }) {
  const available = post.editions;
  if (available.length === 1) return <PostBody blocks={post.body} />;

  const group = `edition-${post.slug}`;

  return (
    <div className={styles.reader}>
      <fieldset className={styles.switch}>
        <legend className={styles.legend}>Read as</legend>

        {available.map(({ mode, label, readingMinutes }) => (
          // Direct children of the switch: a `display: contents` wrapper here
          // breaks sibling style invalidation when the checked radio changes.
          <Fragment key={mode}>
            <input
              className={styles.input}
              type="radio"
              name={group}
              id={`${group}-${mode}`}
              value={mode}
              defaultChecked={mode === "full"}
            />
            <label className={styles.label} htmlFor={`${group}-${mode}`}>
              {label}
              <span className={styles.time}>{readingMinutes} min</span>
            </label>
          </Fragment>
        ))}
      </fieldset>

      {available.map(({ mode, blocks }) => (
        <div key={mode} className={`${styles.panel} ${PANEL[mode]}`}>
          <PostBody blocks={blocks} />
        </div>
      ))}
    </div>
  );
}
