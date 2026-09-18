export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint (see app/layout.tsx) so the stored theme is applied
 * without a flash of the wrong colors.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="dark"&&t!=="light")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
