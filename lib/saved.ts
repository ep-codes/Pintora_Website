import { useMemo } from "react";
import { parseJson, readStoredString, useStoredString, writeStoredString } from "@/lib/local-store";

// Bookmarked lesson ids (the Bookmarks page), kept in this browser. Saved artworks are in lib/community.ts.
const KEY = "pintora-saved";

function toIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}

/** `undefined` until the browser value is known. */
export function useSavedLessons(): string[] | undefined {
  const raw = useStoredString(KEY);
  return useMemo(() => (raw === undefined ? undefined : toIds(parseJson(raw))), [raw]);
}

export function toggleSavedLesson(id: string) {
  const ids = toIds(parseJson(readStoredString(KEY)));
  writeStoredString(KEY, JSON.stringify(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
}

export function clearSavedLessons() {
  writeStoredString(KEY, null);
}
