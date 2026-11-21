import { useMemo } from "react";
import { parseJson, readStoredString, useStoredString, writeStoredString } from "@/lib/local-store";

// Lesson practice progress, kept in this browser. `step` is the 0-based step the learner is on.
export type LessonProgress = { step: number; completed: boolean; updatedAt: number };
export type ProgressMap = Record<string, LessonProgress>;

const KEY = "pintora-progress";

function toProgressMap(value: unknown): ProgressMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const map: ProgressMap = {};
  for (const [id, entry] of Object.entries(value)) {
    const { step, completed, updatedAt } = (entry ?? {}) as Record<string, unknown>;
    if (typeof step === "number" && typeof completed === "boolean" && typeof updatedAt === "number") map[id] = { step, completed, updatedAt };
  }
  return map;
}

function readMap() {
  return toProgressMap(parseJson(readStoredString(KEY)));
}

/** `undefined` until the browser value is known. */
export function useProgress(): ProgressMap | undefined {
  const raw = useStoredString(KEY);
  return useMemo(() => (raw === undefined ? undefined : toProgressMap(parseJson(raw))), [raw]);
}

export function getLessonProgress(id: string): LessonProgress | undefined {
  return readMap()[id];
}

export function recordLessonStep(id: string, step: number) {
  const map = readMap();
  map[id] = { step, completed: map[id]?.completed ?? false, updatedAt: Date.now() };
  writeStoredString(KEY, JSON.stringify(map));
}

export function markLessonCompleted(id: string, stepCount: number) {
  const map = readMap();
  map[id] = { step: stepCount - 1, completed: true, updatedAt: Date.now() };
  writeStoredString(KEY, JSON.stringify(map));
}

export function clearProgress() {
  writeStoredString(KEY, null);
}
