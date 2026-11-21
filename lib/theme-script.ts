import { STORAGE_CHANGE_EVENT } from "@/lib/storage-event";

// No React imports here: the root layout (a Server Component) inlines this script.

export const THEME_KEY = "pintora-theme";

// Runs in <head> before the first paint. Resolves the saved preference ("light", "dark", or
// nothing = follow the system) to data-theme on <html>, and keeps it in sync when the system
// setting changes or the preference is saved (here or in another tab).
export const themeInitScript = `(function(){var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");function a(){var p=null;try{p=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}var t=p==="dark"||(p!=="light"&&m.matches)?"dark":"light";d.setAttribute("data-theme",t);d.style.colorScheme=t}a();m.addEventListener("change",a);window.addEventListener("storage",a);window.addEventListener(${JSON.stringify(STORAGE_CHANGE_EVENT)},a)})()`;
