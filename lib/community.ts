import { useEffect, useSyncExternalStore } from "react";
import { works } from "@/lib/gallery";
import { showNotice } from "@/lib/notice";
import { onUserChange } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { readUserData, savesDone, toggleId, useUserData } from "@/lib/user-data";

// Likes, saves and comments on community artwork, shared by everyone on Pintora (Supabase).

export const COMMENT_MAX = 300;

/** Ids of artworks you like; `undefined` until loaded. */
export const useLikedWorks = () => useUserData((data) => data.likes);

/** Ids of artworks in the profile's Saved tab, oldest first; `undefined` until loaded. (Bookmarked lessons are in lib/saved.ts.) */
export const useSavedWorks = () => useUserData((data) => data.savedWorks);
export const toggleSavedWork = (id: string) => toggleId("savedWorks", id);

export async function toggleLikedWork(id: string) {
  const data = readUserData();
  if (!data) return;
  const change = data.likes.includes(id) ? -1 : 1;
  changeStats(id, { likes: change });
  if (!await toggleId("likes", id)) changeStats(id, { likes: -change });
}

// ---- How many likes and comments each artwork has ----

type WorkStats = { likes: number; comments: number };
let stats: Record<string, WorkStats> | undefined;
let statChanges = 0;
const statListeners = new Set<() => void>();

function setStats(next: typeof stats) {
  stats = next;
  statListeners.forEach((listener) => listener());
}

function changeStats(id: string, { likes = 0, comments = 0 }: Partial<WorkStats>) {
  statChanges++;
  if (!stats) return;
  const current = stats[id] ?? { likes: 0, comments: 0 };
  setStats({ ...stats, [id]: { likes: Math.max(0, current.likes + likes), comments: Math.max(0, current.comments + comments) } });
}

async function loadStats() {
  await savesDone();
  const changesBefore = statChanges;
  const { data } = await supabase.rpc("work_stats", { work_ids: works.map((work) => work.id) });
  if (changesBefore !== statChanges) return loadStats(); // counted before the latest click was saved
  if (data) setStats(Object.fromEntries((data as ({ work_id: string } & WorkStats)[]).map(({ work_id, likes, comments }) => [work_id, { likes, comments }])));
}

/** Real likes and comments by artwork id (the sample ones in lib/gallery.ts come on top); `undefined` until loaded. */
export function useWorkStats() {
  useEffect(() => { void loadStats(); }, []);
  return useSyncExternalStore(
    (listener) => { statListeners.add(listener); return () => { statListeners.delete(listener); }; },
    () => stats,
    () => undefined,
  );
}

// ---- Comments ----

export type Comment = { id: string; text: string; createdAt: number; author: { id: string; name: string; username: string } };
type CommentList = { comments: Comment[]; failed: boolean };
type CommentRow = { id: string; body: string; created_at: string; author: Comment["author"] };

const COMMENT_COLUMNS = "id, body, created_at, author:profiles(id, name, username)";
const COMMENTS_SHOWN = 200;
let commentLists: Record<string, CommentList> = {};
const commentListeners = new Set<() => void>();

const toComment = (row: CommentRow): Comment => ({ id: row.id, text: row.body, createdAt: Date.parse(row.created_at), author: row.author });

function setComments(workId: string, list: CommentList) {
  commentLists = { ...commentLists, [workId]: list };
  commentListeners.forEach((listener) => listener());
}

export async function loadComments(workId: string) {
  const { data, error } = await supabase.from("comments").select(COMMENT_COLUMNS).eq("work_id", workId)
    .order("created_at", { ascending: false }).limit(COMMENTS_SHOWN).overrideTypes<CommentRow[], { merge: false }>();
  if (error) setComments(workId, { comments: commentLists[workId]?.comments ?? [], failed: true });
  else setComments(workId, { comments: data.map(toComment), failed: false });
}

/** Comments on an artwork, newest first; `undefined` until loaded. */
export function useComments(workId: string): CommentList | undefined {
  useEffect(() => { void loadComments(workId); }, [workId]);
  return useSyncExternalStore(
    (listener) => { commentListeners.add(listener); return () => { commentListeners.delete(listener); }; },
    () => commentLists[workId],
    () => undefined,
  );
}

/** Resolves to whether the comment was posted. */
export async function addComment(workId: string, text: string): Promise<boolean> {
  const { data, error } = await supabase.from("comments").insert({ work_id: workId, body: text }).select(COMMENT_COLUMNS)
    .single().overrideTypes<CommentRow, { merge: false }>();
  if (error) return false;
  const list = commentLists[workId] ?? { comments: [], failed: false };
  setComments(workId, { ...list, comments: [toComment(data), ...list.comments.filter((comment) => comment.id !== data.id)] });
  changeStats(workId, { comments: 1 });
  return true;
}

export async function deleteComment(workId: string, id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) { showNotice("We couldn’t delete that comment. Please try again."); return; }
  const list = commentLists[workId];
  if (list) setComments(workId, { ...list, comments: list.comments.filter((comment) => comment.id !== id) });
  changeStats(workId, { comments: -1 });
}

// Nothing one person loaded is shown to the next one who logs in here.
if (typeof window !== "undefined") onUserChange(() => { stats = undefined; commentLists = {}; });
