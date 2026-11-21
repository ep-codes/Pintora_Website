import { useSyncExternalStore } from "react";
import { useStoredString, writeStoredString } from "@/lib/local-store";
import { THEME_KEY } from "@/lib/theme-script";

export type ThemePreference = "system" | "light" | "dark";
export type Theme = "light" | "dark";

/** The saved choice; `undefined` until known in the browser. */
export function useThemePreference(): ThemePreference | undefined {
  const raw = useStoredString(THEME_KEY);
  if (raw === undefined) return undefined;
  return raw === "light" || raw === "dark" ? raw : "system";
}

/** Saving fires the storage event that the theme script in <head> listens for, which updates <html>. */
export function setThemePreference(preference: ThemePreference) {
  writeStoredString(THEME_KEY, preference === "system" ? null : preference);
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** The theme currently showing (after resolving "system"); `undefined` until known in the browser. */
export function useResolvedTheme(): Theme | undefined {
  return useSyncExternalStore<Theme | undefined>(
    subscribeToTheme,
    () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"),
    () => undefined,
  );
}
