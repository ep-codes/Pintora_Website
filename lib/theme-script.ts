import { STORAGE_CHANGE_EVENT } from "@/lib/storage-event";

// No React imports here: the root layout (a Server Component) inlines this script.

export const THEME_KEY = "pintora-theme";
export const ACCENT_KEY = "pintora-accent";

// Accent colors a user can pick in Settings → Appearance & Display, one per color family in the pastel palette, plus a neutral grey.
// The first is the default. The colors themselves live in styles.css under [data-accent="…"].
export const accents = ["purple", "orange", "pink", "blue", "green", "grey"] as const;

// Runs in <head> before the first paint, so pages never flash the wrong colors.
// Theme: resolves the saved preference ("light", "dark", or nothing = follow the system) to
// data-theme on <html>. Accent: copies a valid saved accent to data-accent on <html> (none = default).
// Both stay in sync when the system setting changes or a preference is saved (here or in another tab).
export const themeInitScript = `(function(){var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),A=${JSON.stringify(accents.slice(1))};function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function a(){var p=g(${JSON.stringify(THEME_KEY)});var t=p==="dark"||(p!=="light"&&m.matches)?"dark":"light";d.setAttribute("data-theme",t);d.style.colorScheme=t;var c=g(${JSON.stringify(ACCENT_KEY)});if(A.indexOf(c)>=0)d.setAttribute("data-accent",c);else d.removeAttribute("data-accent")}a();m.addEventListener("change",a);window.addEventListener("storage",a);window.addEventListener(${JSON.stringify(STORAGE_CHANGE_EVENT)},a)})()`;
