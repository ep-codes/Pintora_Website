import { useSyncExternalStore } from "react";
import { STORAGE_CHANGE_EVENT } from "@/lib/storage-event";

// A tiny localStorage wrapper that React components can subscribe to, so every component
// reading a key re-renders when any component (or another tab) writes it.
// Reads return `undefined` until the browser value is known (prerendered HTML and the first
// hydration pass), which keeps server HTML and the first client render identical.

export function readStoredString(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onChange);
  };
}

export function useStoredString(key: string): string | null | undefined {
  return useSyncExternalStore<string | null | undefined>(subscribe, () => readStoredString(key), () => undefined);
}

export function writeStoredString(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* storage blocked (private mode etc.): keep the page working without it */ }
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
