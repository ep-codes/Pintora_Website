import { useMemo } from "react";
import { parseJson, useStoredString, writeStoredString } from "@/lib/local-store";

// SIMULATED sign-in. The "session" is a record in this browser's localStorage: nothing is sent
// to a server and no password is kept. To add real accounts later, reimplement useSession,
// signIn and signOut on top of an auth provider; the rest of the site only uses these three.

export type Session = { name: string; email: string };

const KEY = "pintora-session";

function toSession(value: unknown): Session | null {
  if (typeof value !== "object" || value === null) return null;
  const { name, email } = value as Record<string, unknown>;
  return typeof name === "string" && typeof email === "string" ? { name, email } : null;
}

/** `undefined` while not yet known (prerender / first hydration), `null` when signed out. */
export function useSession(): Session | null | undefined {
  const raw = useStoredString(KEY);
  return useMemo(() => (raw === undefined ? undefined : toSession(parseJson(raw))), [raw]);
}

export function signIn(session: Session) {
  writeStoredString(KEY, JSON.stringify(session));
}

export function signOut() {
  writeStoredString(KEY, null);
}

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null, fallback = "/home") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
