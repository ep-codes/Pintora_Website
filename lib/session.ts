import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Accounts, on Supabase Auth. Name, username and bio are in the public.profiles table (see supabase/migrations),
// which signed-in people can read. Email and preferences stay with the private auth user.

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

export type Preferences = { mediums: string[]; level: SkillLevel; weeklyDigest: boolean; replyEmails: boolean; keepUsername: boolean };
export type Account = {
  id: string; name: string; username: string;
  /** Still the username made from their name at sign-up. */
  automaticUsername: boolean;
  email: string; bio: string; joinedAt: number; preferences: Preferences;
};

export const USERNAME_MAX = 30;
export const PASSWORD_MIN = 8;
const defaultPreferences: Preferences = { mediums: [], level: "Beginner", weeklyDigest: true, replyEmails: true, keepUsername: false };
const SIGNED_OUT = "You're signed out. Log in again to save changes.";

/** Lowercase letters, numbers, dots and underscores: the only characters a username may contain. */
export const cleanUsername = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, USERNAME_MAX);

// ---- Session store ----

type State = {
  /** `undefined` while not yet known, `null` when signed out. */
  account: Account | null | undefined;
  /** Signed in, but the profile couldn't be loaded. */
  failed: boolean;
  /** Arrived from a password reset email and hasn't picked a new password yet. */
  recovering: boolean;
};

const RECOVERY_KEY = "pintora-recovering"; // sessionStorage, so a refresh of the reset page keeps working
const initialState: State = { account: undefined, failed: false, recovering: false };
let state = initialState;
const listeners = new Set<() => void>();

function setState(changes: Partial<State>) {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
}

function useStore<T>(select: (current: State) => T): T {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => select(state),
    () => select(initialState), // prerendered HTML and the first client render must match
  );
}

/** The signed-in account: `undefined` while not yet known (prerender / loading), `null` when signed out. */
export const useSession = () => useStore((current) => current.account);
export const useSessionFailed = () => useStore((current) => current.failed);
export const useRecovering = () => useStore((current) => current.recovering);

function setRecovering(recovering: boolean) {
  try { if (recovering) sessionStorage.setItem(RECOVERY_KEY, "1"); else sessionStorage.removeItem(RECOVERY_KEY); } catch { /* private window */ }
  setState({ recovering });
}

type Profile = { username: string; name: string; bio: string; created_at: string };
const PROFILE_COLUMNS = "username, name, bio, created_at";

function toPreferences(value: unknown): Preferences {
  const prefs = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  return {
    mediums: Array.isArray(prefs.mediums) ? prefs.mediums.filter((m): m is string => typeof m === "string") : defaultPreferences.mediums,
    level: skillLevels.find((level) => level === prefs.level) ?? defaultPreferences.level,
    weeklyDigest: typeof prefs.weeklyDigest === "boolean" ? prefs.weeklyDigest : defaultPreferences.weeklyDigest,
    replyEmails: typeof prefs.replyEmails === "boolean" ? prefs.replyEmails : defaultPreferences.replyEmails,
    keepUsername: prefs.keepUsername === true,
  };
}

/** Mirrors handle_new_user in supabase/migrations: the sign-up name, plus part of the id if that was taken. */
function isAutomaticUsername(user: Pick<User, "id" | "user_metadata">, username: string) {
  const signUpName = (typeof user.user_metadata.name === "string" && user.user_metadata.name.trim()) || "New artist";
  const base = signUpName.slice(0, 40).toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 22) || "artist";
  return username === base || username === `${base}_${user.id.slice(0, 7)}`;
}

const toAccount = (user: User, profile: Profile): Account => ({
  id: user.id, email: user.email ?? "", name: profile.name, username: profile.username, bio: profile.bio,
  automaticUsername: isAutomaticUsername(user, profile.username),
  joinedAt: Date.parse(profile.created_at),
  preferences: unsavedPreferences ?? toPreferences(user.user_metadata.preferences),
});

let unsavedPreferences: Preferences | null = null;
let latestLoad = 0;

async function load(user: User | null) {
  const thisLoad = ++latestLoad;
  if (state.account?.id !== user?.id) unsavedPreferences = null;
  if (!user) { setState({ account: null, failed: false }); return; }
  if (state.account?.id !== user.id) setState({ account: undefined, failed: false });
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).single<Profile>();
  if (thisLoad !== latestLoad) return; // something newer happened meanwhile
  if (!error) setState({ account: toAccount(user, data), failed: false });
  else if (!state.account) setState({ failed: true }); // a failed refresh keeps what's already showing
}

/** Tries again after useSessionFailed. */
export async function reloadSession() {
  const { data } = await supabase.auth.getSession();
  await load(data.session?.user ?? null);
}

if (typeof window !== "undefined") {
  try { if (sessionStorage.getItem(RECOVERY_KEY)) state = { ...state, recovering: true }; } catch { /* private window */ }
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") setRecovering(true);
    if (!session && state.recovering) setRecovering(false);
    if (event === "TOKEN_REFRESHED") return; // same person, nothing to reload
    // Supabase calls can't be made inside this callback (they would wait on each other).
    setTimeout(() => load(session?.user ?? null), 0);
  });
}

// ---- Signing up, in and out ----

/** A readable message for anything Supabase Auth or the database returns. */
function errorMessage(error: { message: string; name?: string; code?: string; status?: number }): string {
  switch (error.code) {
    case "invalid_credentials": return "That email or password isn't right.";
    case "email_not_confirmed": return "Confirm your email first. Open the link we sent you, then log in.";
    case "email_exists": case "user_already_exists": return "Another account already uses that email.";
    case "email_address_invalid": return "That email address doesn't look right.";
    case "validation_failed": return "Please check what you entered and try again.";
    case "email_address_not_authorized": return "We can't send email to that address yet.";
    case "over_email_send_rate_limit": return "Too many emails were sent recently. Please try again in an hour.";
    case "over_request_rate_limit": return "Too many tries. Please wait a few minutes.";
    case "signup_disabled": case "email_provider_disabled": return "New accounts aren't open right now.";
    case "same_password": return "That's already your password. Choose a different one.";
    case "weak_password": return error.message;
    case "otp_expired": return "That link has expired or was already used. Please ask for a new one.";
    case "session_not_found": case "session_expired": case "refresh_token_not_found": case "user_not_found": return SIGNED_OUT;
    case "23505": return "That username is already taken.";
    case "23514": return "Please check your name, username and bio, then try again.";
    case "PGRST202": return "Deleting accounts isn't set up yet.";
  }
  if (error.name === "AuthSessionMissingError") return SIGNED_OUT;
  if (error.name === "AuthRetryableFetchError" || /fetch|network/i.test(error.message)) return "We couldn't reach Pintora. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

const siteUrl = (path: string) => window.location.origin + path;

/** Creates an account. With email confirmation on, the visitor isn't signed in until they open the emailed link. */
export async function signUp({ name, email, password, next }: { name: string; email: string; password: string; next: string | null }): Promise<{ error: string | null; confirmEmail: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: confirmUrl(next) } });
  return { error: error && errorMessage(error), confirmEmail: !error && !data.session };
}

const confirmUrl = (next: string | null) => siteUrl(`/login${next ? `?next=${encodeURIComponent(safeNext(next))}` : ""}`);

export async function resendConfirmation(email: string, next: string | null): Promise<string | null> {
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmUrl(next) } });
  return error && errorMessage(error);
}

export async function signIn(email: string, password: string): Promise<{ error: string | null; unconfirmed: boolean }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error && errorMessage(error), unconfirmed: error?.code === "email_not_confirmed" };
}

/** Signs out on this device. */
export function signOut() {
  void supabase.auth.signOut({ scope: "local" });
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl("/reset-password") });
  return error && errorMessage(error);
}

/** Sets a new password after arriving from a reset email. */
export async function resetPassword(password: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return errorMessage(error);
  setRecovering(false);
  return null;
}

// ---- Changing the account ----
// These return an error message, or null on success.

export async function changePassword(current: string, password: string): Promise<string | null> {
  const { account } = state;
  if (!account) return SIGNED_OUT;
  const check = await supabase.auth.signInWithPassword({ email: account.email, password: current });
  if (check.error) return check.error.code === "invalid_credentials" ? "Your current password isn't right." : errorMessage(check.error);
  const { error } = await supabase.auth.updateUser({ password, current_password: current });
  return error && errorMessage(error);
}

/** The email only changes once the link sent to it is opened. */
export async function changeEmail(email: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: siteUrl("/settings") });
  return error && errorMessage(error);
}

export async function updateProfile(changes: Pick<Account, "name" | "username" | "bio">): Promise<string | null> {
  const { account } = state;
  if (!account) return SIGNED_OUT;
  const { data, error } = await supabase.from("profiles").update(changes).eq("id", account.id).select(PROFILE_COLUMNS).single<Profile>();
  if (error) return errorMessage(error);
  latestLoad++; // a load that started before this save would bring the old values back
  if (state.account?.id === account.id) setState({ account: {
    ...state.account, name: data.name, username: data.username, bio: data.bio,
    automaticUsername: state.account.automaticUsername && data.username === account.username,
  } });
  return null;
}

let preferencesQueue: Promise<unknown> = Promise.resolve();

/** Shows the change right away and saves it in the background, one save at a time. */
export function updatePreferences(changes: Partial<Preferences>): Promise<string | null> {
  const { account } = state;
  if (!account) return Promise.resolve(SIGNED_OUT);
  const preferences = { ...account.preferences, ...changes };
  unsavedPreferences = preferences;
  setState({ account: { ...account, preferences } });
  const save = preferencesQueue.then(async () => {
    if (state.account?.id !== account.id) return SIGNED_OUT;
    const { error } = await supabase.auth.updateUser({ data: { preferences } });
    if (unsavedPreferences === preferences) {
      unsavedPreferences = null;
      if (error) await reloadSession(); // nothing newer is waiting: go back to what's saved
    }
    return error && errorMessage(error);
  });
  preferencesQueue = save.catch(() => {});
  return save;
}

/** Permanently deletes the signed-in account and signs out. */
export async function deleteAccount(): Promise<string | null> {
  const { error } = await supabase.rpc("delete_account");
  if (error) return errorMessage(error);
  signOut();
  return null;
}

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(next: string | null, fallback = "/home") {
  if (!next?.startsWith("/")) return fallback;
  try {
    // Parsing catches forms a browser would treat as another site, like //evil.com or /\evil.com.
    const url = new URL(next, "http://pintora.invalid");
    return url.origin === "http://pintora.invalid" ? url.pathname + url.search + url.hash : fallback;
  } catch { return fallback; }
}
