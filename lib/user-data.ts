import { useSyncExternalStore } from "react";
import { lessons } from "@/lib/lessons";
import { parseJson, readStoredString, writeStoredString } from "@/lib/local-store";
import { showNotice } from "@/lib/notice";
import { onUserChange } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { works } from "@/lib/gallery";

// What each person has liked, saved, bookmarked and practiced. Members' data is in Supabase
// (supabase/migrations/…_community_and_learning.sql) and kept in memory here. Guests' data stays in this
// browser until they log in, when it moves to their account.

export type LessonProgress = { step: number; completed: boolean; updatedAt: number };
export type ProgressMap = Record<string, LessonProgress>;
type IdList = "likes" | "savedWorks" | "bookmarks";
export type UserData = Record<IdList, string[]> & { progress: ProgressMap };

const lists = {
  likes: { table: "likes", column: "work_id", storageKey: "pintora-likes", known: works.map((work) => work.id) },
  savedWorks: { table: "saved_works", column: "work_id", storageKey: "pintora-saved-works", known: works.map((work) => work.id) },
  bookmarks: { table: "bookmarks", column: "lesson_id", storageKey: "pintora-saved", known: lessons.map((lesson) => lesson.id) },
} as const;
const listNames = Object.keys(lists) as IdList[];
const PROGRESS_KEY = "pintora-progress";

// ---- Store ----

type State = { data: UserData | undefined; failed: boolean };
let state: State = { data: undefined, failed: false };
const listeners = new Set<() => void>();
let userId: string | null | undefined; // undefined: not known yet · null: guest

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

/** Part of the visitor's data; `undefined` until it has loaded. */
export function useUserData<T>(select: (data: UserData) => T): T | undefined {
  return useSyncExternalStore(subscribe, () => state.data && select(state.data), () => undefined);
}
export const useUserDataFailed = () => useSyncExternalStore(subscribe, () => state.failed, () => false);
export const readUserData = () => state.data;

// ---- This browser (guests) ----

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

function readIds(name: IdList): string[] {
  const value = parseJson(readStoredString(lists[name].storageKey));
  const known: readonly string[] = lists[name].known;
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => known.includes(id)))] : [];
}

function readBrowser(): UserData {
  const progress: ProgressMap = {};
  const stored = parseJson(readStoredString(PROGRESS_KEY));
  if (isRecord(stored)) for (const lesson of lessons) {
    const entry = stored[lesson.id];
    if (!isRecord(entry) || typeof entry.step !== "number" || typeof entry.completed !== "boolean" || typeof entry.updatedAt !== "number") continue;
    const step = Math.min(Math.max(Math.trunc(entry.step) || 0, 0), lesson.steps.length - 1);
    progress[lesson.id] = { step, completed: entry.completed, updatedAt: entry.updatedAt };
  }
  return { likes: readIds("likes"), savedWorks: readIds("savedWorks"), bookmarks: readIds("bookmarks"), progress };
}

function writeBrowser(data: UserData) {
  for (const name of listNames) writeStoredString(lists[name].storageKey, data[name].length ? JSON.stringify(data[name]) : null);
  writeStoredString(PROGRESS_KEY, Object.keys(data.progress).length ? JSON.stringify(data.progress) : null);
}

// ---- Supabase (members) ----

function check(...results: { error: { message: string } | null }[]) {
  for (const { error } of results) if (error) throw new Error(error.message);
}

/** Moves anything collected in this browser as a guest into the account. What the account already has wins. */
async function importBrowserData() {
  const data = readBrowser();
  for (const name of listNames) {
    const { table, column, storageKey } = lists[name];
    if (data[name].length) check(await supabase.from(table).upsert(data[name].map((id) => ({ [column]: id })), { onConflict: `user_id,${column}`, ignoreDuplicates: true }));
    writeStoredString(storageKey, null);
  }
  const rows = Object.entries(data.progress).map(([id, entry]) => progressRow(id, entry));
  if (rows.length) check(await supabase.from("lesson_progress").upsert(rows, { onConflict: "user_id,lesson_id", ignoreDuplicates: true }));
  writeStoredString(PROGRESS_KEY, null);
}

const progressRow = (id: string, { step, completed, updatedAt }: LessonProgress) => ({ lesson_id: id, step, completed, updated_at: new Date(Number.isFinite(updatedAt) && Math.abs(updatedAt) < 8.64e15 ? updatedAt : Date.now()).toISOString() });

async function fetchUserData(): Promise<UserData> {
  const [likes, savedWorks, bookmarks, progress] = await Promise.all([
    supabase.from("likes").select("work_id").order("created_at"),
    supabase.from("saved_works").select("work_id").order("created_at"),
    supabase.from("bookmarks").select("lesson_id").order("created_at"),
    supabase.from("lesson_progress").select("lesson_id, step, completed, updated_at"),
  ]);
  check(likes, savedWorks, bookmarks, progress);
  return {
    likes: (likes.data ?? []).map((row) => row.work_id as string),
    savedWorks: (savedWorks.data ?? []).map((row) => row.work_id as string),
    bookmarks: (bookmarks.data ?? []).map((row) => row.lesson_id as string),
    progress: Object.fromEntries((progress.data ?? []).map((row) => [row.lesson_id as string, { step: row.step as number, completed: row.completed as boolean, updatedAt: Date.parse(row.updated_at as string) }])),
  };
}

let queue: Promise<unknown> = Promise.resolve(); // saves run one at a time, in the order they were made
let pending = 0;
let saves = 0;
let saveFailed = false;
let latestLoad = 0;
let saved: UserData | undefined; // what Supabase has, without changes still being saved

/** Resolves once everything changed so far has been saved (or has failed to). */
export const savesDone = () => queue;

export async function loadUserData() {
  const owner = userId;
  const thisLoad = ++latestLoad;
  const isCurrent = () => thisLoad === latestLoad && owner === userId;
  if (!owner) return;
  if (state.failed) setState({ ...state, failed: false });
  try {
    for (;;) {
      await queue;
      const savesBefore = saves;
      await importBrowserData();
      if (!isCurrent()) return;
      const data = await fetchUserData();
      if (!isCurrent()) return;
      if (saves !== savesBefore) continue; // something was saved meanwhile, so this is already out of date
      saved = data;
      setState({ data, failed: false });
      return;
    }
  } catch {
    if (isCurrent()) setState({ data: state.data, failed: !state.data });
  }
}

function save(update: (data: UserData) => UserData, write: () => PromiseLike<{ error: unknown }>): Promise<boolean> {
  const owner = userId;
  pending++; saves++;
  const result = queue.then(async () => {
    let ok = false;
    try { ok = owner === userId && !(await write()).error; } catch { /* offline */ }
    pending--;
    if (owner !== userId) return ok; // logged out meanwhile
    if (!ok) saveFailed = true;
    else if (saved) saved = update(saved);
    if (!pending && saveFailed) {
      saveFailed = false;
      showNotice("We couldn’t save that. Check your connection and try again.");
      if (saved) setState({ data: saved, failed: false });
      void loadUserData();
    }
    return ok;
  });
  queue = result;
  return result;
}

/** Shows a change right away, then saves it (undoing it if that fails). Resolves to whether it was saved. */
export function changeUserData(update: (data: UserData) => UserData, write: () => PromiseLike<{ error: unknown }>): Promise<boolean> {
  if (userId === null) {
    const data = update(readBrowser()); // another tab may have changed it
    writeBrowser(data);
    setState({ data, failed: false });
    return Promise.resolve(true);
  }
  if (!userId || !state.data) return Promise.resolve(false); // still loading
  setState({ data: update(state.data), failed: false });
  return save(update, write);
}

/** Adds the id, or removes it if it's there. */
export function toggleId(name: IdList, id: string): Promise<boolean> {
  const { table, column } = lists[name];
  const remove = state.data?.[name].includes(id) ?? false;
  return changeUserData(
    (data) => ({ ...data, [name]: remove ? data[name].filter((value) => value !== id) : [...data[name].filter((value) => value !== id), id] }),
    () => remove
      ? supabase.from(table).delete().eq(column, id)
      : supabase.from(table).upsert([{ [column]: id }], { onConflict: `user_id,${column}`, ignoreDuplicates: true }),
  );
}

export function clearIds(name: IdList) {
  const { table, column } = lists[name];
  changeUserData((data) => ({ ...data, [name]: [] }), () => supabase.from(table).delete().neq(column, ""));
}

export function setLessonProgress(id: string, entry: LessonProgress) {
  changeUserData(
    (data) => ({ ...data, progress: { ...data.progress, [id]: entry } }),
    () => supabase.from("lesson_progress").upsert(progressRow(id, entry), { onConflict: "user_id,lesson_id" }),
  );
}

export function clearLessonProgress() {
  changeUserData((data) => ({ ...data, progress: {} }), () => supabase.from("lesson_progress").delete().neq("lesson_id", ""));
}

if (typeof window !== "undefined") onUserChange((id) => {
  userId = id;
  latestLoad++;
  saved = undefined;
  setState({ data: id === null ? readBrowser() : undefined, failed: false });
  void loadUserData();
});
