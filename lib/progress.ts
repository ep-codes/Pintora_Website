import { clearLessonProgress, readUserData, setLessonProgress, useUserData, type LessonProgress } from "@/lib/user-data";

// Lesson practice progress. `step` is the 0-based step the learner is on.

/** `undefined` until loaded. */
export const useProgress = () => useUserData((data) => data.progress);

export const getLessonProgress = (id: string): LessonProgress | undefined => readUserData()?.progress[id];

export function recordLessonStep(id: string, step: number) {
  setLessonProgress(id, { step, completed: getLessonProgress(id)?.completed ?? false, updatedAt: Date.now() });
}

export function markLessonCompleted(id: string, stepCount: number) {
  setLessonProgress(id, { step: stepCount - 1, completed: true, updatedAt: Date.now() });
}

export const clearProgress = clearLessonProgress;
