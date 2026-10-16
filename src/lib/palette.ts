/**
 * The handful of palette values that have to exist in TypeScript as well as
 * CSS: the OG image runs through satori, which can't read custom properties,
 * and the `theme-color` metas are attribute strings.
 *
 * Every other colour lives only in `src/styles/globals.css`. Keep these in
 * step with the `--color-*` tokens of the same name there.
 */
export const palette = {
  light: {
    background: "#fafafa",
  },
  dark: {
    background: "#09090b",
    foreground: "#f4f4f5",
    mutedForeground: "#a1a1ad",
    accent: "#7aa7ff",
  },
} as const;
