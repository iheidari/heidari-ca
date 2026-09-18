import { Fragment } from "react";
import PostBody from "@/components/PostBody";
import { editions, type LocalPost } from "@/content/posts";
import styles from "./PostReader.module.css";

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
  const available = editions(post);
  if (available.length === 1) return <PostBody blocks={post.body} />;

  const group = `edition-${post.slug}`;

  return (
    <div className={styles.reader}>
      <fieldset className={styles.switch}>
        <legend className={styles.legend}>Read as</legend>

        {available.map(({ mode, label, readingTime }) => (
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
              <span className={styles.time}>
                {readingTime.replace(" read", "")}
              </span>
            </label>
          </Fragment>
        ))}
      </fieldset>

      {available.map(({ mode, blocks }) => (
        <div key={mode} className={styles.panel} data-mode={mode}>
          <PostBody blocks={blocks} />
        </div>
      ))}
    </div>
  );
}
