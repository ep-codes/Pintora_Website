import { useMemo } from "react";
import { parseJson, readStoredString, useStoredString, writeStoredString } from "@/lib/local-store";

// SIMULATED accounts. Accounts live in this browser's localStorage (so logging out and back in
// with the same email keeps your profile), and the session just records which account is signed in.
// Nothing is sent to a server and no password is kept. To add real accounts later, reimplement
// this module's exports on top of an auth provider; the rest of the site only uses these.

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

export type Preferences = { mediums: string[]; level: SkillLevel; weeklyDigest: boolean; replyEmails: boolean };
export type Account = { id: string; name: string; username: string; email: string; bio: string; joinedAt: number; preferences: Preferences };

const ACCOUNTS_KEY = "pintora-accounts";
const SESSION_KEY = "pintora-session";
const defaultPreferences: Preferences = { mediums: [], level: "Beginner", weeklyDigest: true, replyEmails: true };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export const USERNAME_MAX = 30;

/** Lowercase letters, numbers, dots and underscores: the only characters a username may contain. */
export const cleanUsername = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, USERNAME_MAX);
const defaultUsername = (name: string) => cleanUsername(name) || "artist";
const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function toAccount(id: string, value: unknown): Account | null {
  if (!isRecord(value)) return null;
  const { name, username, email, bio, joinedAt, preferences } = value;
  if (typeof name !== "string" || typeof email !== "string") return null;
  const prefs = isRecord(preferences) ? preferences : {};
  return {
    id, name, email,
    // Accounts from before usernames existed get one based on their name.
    username: (typeof username === "string" && cleanUsername(username)) || defaultUsername(name),
    bio: typeof bio === "string" ? bio : "",
    joinedAt: typeof joinedAt === "number" ? joinedAt : 0,
    preferences: {
      mediums: Array.isArray(prefs.mediums) ? prefs.mediums.filter((m): m is string => typeof m === "string") : [],
      level: skillLevels.find((level) => level === prefs.level) ?? defaultPreferences.level,
      weeklyDigest: typeof prefs.weeklyDigest === "boolean" ? prefs.weeklyDigest : defaultPreferences.weeklyDigest,
      replyEmails: typeof prefs.replyEmails === "boolean" ? prefs.replyEmails : defaultPreferences.replyEmails,
    },
  };
}

function parseAccounts(raw: string | null): Record<string, Account> {
  const value = parseJson(raw);
  const accounts: Record<string, Account> = {};
  if (isRecord(value)) for (const [id, entry] of Object.entries(value)) { const account = toAccount(id, entry); if (account) accounts[id] = account; }
  return accounts;
}

const readAccounts = () => parseAccounts(readStoredString(ACCOUNTS_KEY));
const writeAccounts = (accounts: Record<string, Account>) => writeStoredString(ACCOUNTS_KEY, JSON.stringify(accounts));

function currentAccount(rawSession: string | null, accounts: Record<string, Account>): Account | null {
  const session = parseJson(rawSession);
  if (!isRecord(session)) return null;
  if (typeof session.accountId === "string") return accounts[session.accountId] ?? null;
  // Sessions from before accounts existed stored the profile inline.
  return toAccount("legacy", session);
}

/** The signed-in account: `undefined` while not yet known (prerender / first hydration), `null` when signed out. */
export function useSession(): Account | null | undefined {
  const rawSession = useStoredString(SESSION_KEY);
  const rawAccounts = useStoredString(ACCOUNTS_KEY);
  return useMemo(() => {
    if (rawSession === undefined || rawAccounts === undefined) return undefined;
    return currentAccount(rawSession, parseAccounts(rawAccounts));
  }, [rawSession, rawAccounts]);
}

function availableUsername(name: string, accounts: Record<string, Account>) {
  const taken = new Set(Object.values(accounts).map((a) => a.username));
  const base = defaultUsername(name);
  let username = base;
  for (let n = 2; taken.has(username); n++) username = `${base.slice(0, USERNAME_MAX - String(n).length)}${n}`;
  return username;
}

/** Signs in to the account with this email, creating it if this browser hasn't seen it. */
export function signIn({ email, name }: { email: string; name?: string }) {
  const accounts = readAccounts();
  let account = Object.values(accounts).find((a) => sameEmail(a.email, email));
  if (!account) {
    const displayName = name?.trim() || email.split("@")[0];
    account = { id: crypto.randomUUID(), name: displayName, username: availableUsername(displayName, accounts), email: email.trim(), bio: "", joinedAt: Date.now(), preferences: { ...defaultPreferences } };
    accounts[account.id] = account;
    writeAccounts(accounts);
  }
  writeStoredString(SESSION_KEY, JSON.stringify({ accountId: account.id }));
}

export function signOut() {
  writeStoredString(SESSION_KEY, null);
}

/** Updates the signed-in account. Returns an error message, or null on success. */
export function updateAccount(changes: Partial<Pick<Account, "name" | "username" | "email" | "bio" | "preferences">>): string | null {
  const accounts = readAccounts();
  const account = currentAccount(readStoredString(SESSION_KEY), accounts);
  if (!account) return "You're signed out. Log in again to save changes.";
  if (changes.email && Object.values(accounts).some((a) => a.id !== account.id && sameEmail(a.email, changes.email!))) {
    return "Another account on this browser already uses that email.";
  }
  if (changes.username && changes.username !== account.username && Object.values(accounts).some((a) => a.id !== account.id && a.username === changes.username)) {
    return "That username is already taken on this browser.";
  }
  const updated = { ...account, ...changes };
  if (account.id === "legacy") {
    // Upgrade an old inline session to a stored account.
    updated.id = crypto.randomUUID();
    accounts[updated.id] = updated;
    writeAccounts(accounts);
    writeStoredString(SESSION_KEY, JSON.stringify({ accountId: updated.id }));
    return null;
  }
  accounts[account.id] = updated;
  writeAccounts(accounts);
  return null;
}

/** Removes the signed-in account from this browser and signs out. */
export function deleteAccount() {
  const accounts = readAccounts();
  const account = currentAccount(readStoredString(SESSION_KEY), accounts);
  if (account) { delete accounts[account.id]; writeAccounts(accounts); }
  signOut();
}

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null, fallback = "/home") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
