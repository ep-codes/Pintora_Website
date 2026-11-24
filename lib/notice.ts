import { useSyncExternalStore } from "react";

// One short message at a time, for problems with no better place to show them (see components/notice.tsx).
let message: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function set(next: string | null) {
  message = next;
  listeners.forEach((listener) => listener());
}

export function showNotice(text: string) {
  clearTimeout(timer);
  set(text);
  timer = setTimeout(() => set(null), 6000);
}

export const useNotice = () => useSyncExternalStore(
  (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  () => message,
  () => null,
);
