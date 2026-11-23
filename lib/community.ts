import { useMemo } from "react";
import { parseJson, readStoredString, useStoredString, writeStoredString } from "@/lib/local-store";
import type { Account } from "@/lib/session";

// Likes and comments on community artwork, kept in this browser. Nothing is sent to a server.
export type Comment = { id: string; workId: string; authorId: string; name: string; username: string; text: string; createdAt: number };

const LIKES_KEY = "pintora-likes";
const COMMENTS_KEY = "pintora-comments";
export const COMMENT_MAX = 300;

function toIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}

function toComments(value: unknown): Comment[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Comment => {
    const { createdAt, ...rest } = (entry ?? {}) as Record<string, unknown>;
    return typeof createdAt === "number" && ["id", "workId", "authorId", "name", "username", "text"].every((key) => typeof rest[key] === "string");
  });
}

const readComments = () => toComments(parseJson(readStoredString(COMMENTS_KEY)));
const writeComments = (comments: Comment[]) => writeStoredString(COMMENTS_KEY, JSON.stringify(comments));

/** Ids of liked works; `undefined` until the browser value is known. */
export function useLikedWorks(): string[] | undefined {
  const raw = useStoredString(LIKES_KEY);
  return useMemo(() => (raw === undefined ? undefined : toIds(parseJson(raw))), [raw]);
}

export function toggleLikedWork(id: string) {
  const ids = toIds(parseJson(readStoredString(LIKES_KEY)));
  writeStoredString(LIKES_KEY, JSON.stringify(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
}

/** Comments written in this browser, newest first; `undefined` until known. */
export function useComments(): Comment[] | undefined {
  const raw = useStoredString(COMMENTS_KEY);
  return useMemo(() => (raw === undefined ? undefined : toComments(parseJson(raw)).sort((a, b) => b.createdAt - a.createdAt)), [raw]);
}

export function addComment(workId: string, author: Account, text: string) {
  writeComments([...readComments(), { id: crypto.randomUUID(), workId, authorId: author.id, name: author.name, username: author.username, text, createdAt: Date.now() }]);
}

export function deleteComment(id: string) {
  writeComments(readComments().filter((comment) => comment.id !== id));
}

/** Used when an account is deleted. */
export function clearCommunityActivity(authorId: string) {
  writeStoredString(LIKES_KEY, null);
  writeComments(readComments().filter((comment) => comment.authorId !== authorId));
}
