"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

/*
 * The `data-theme` attribute on <html> is the source of truth: the pre-paint
 * script in lib/theme.ts sets it before React exists. Reading it through
 * useSyncExternalStore is what `react-hooks/set-state-in-effect` asks for —
 * a useState + useEffect read of the DOM is a lint error in this repo.
 * Only aria-pressed depends on this; the icon swap is pure CSS.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light");

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works.
    }
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label="Toggle dark theme"
      aria-pressed={theme === "dark"}
      title="Toggle dark theme"
    >
      <span className={styles.icons}>
        <SunIcon className={styles.sun} />
        <MoonIcon className={styles.moon} />
      </span>
    </button>
  );
}
