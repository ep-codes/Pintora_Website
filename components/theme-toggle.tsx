"use client";
import { Icon } from "@/components/icons";
import { setThemePreference, useResolvedTheme } from "@/lib/theme";

/** One-click switch between light and dark. "Follow the system" lives in Settings → Appearance & Display. */
export default function ThemeToggle() {
  const theme = useResolvedTheme();
  const next = theme === "dark" ? "light" : "dark";
  return <button type="button" className="theme-toggle" onClick={() => setThemePreference(next)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
    <Icon name={theme === "dark" ? "sun" : "moon"} />
  </button>;
}
