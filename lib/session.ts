import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { AVATAR_BUCKET, prepareAvatar } from "@/lib/avatar";
import { supabase } from "@/lib/supabase";

// Accounts, on Supabase Auth. Name, username, bio and picture are in the public.profiles table (see supabase/migrations),
// which signed-in people can read. Email and preferences stay with the private auth user.

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

export type Preferences = { mediums: string[]; level: SkillLevel; weeklyDigest: boolean; replyEmails: boolean; keepUsername: boolean };
export type Account = {
  id: string; name: string; username: string;
  /** Still the username made from their name at sign-up. */
  automaticUsername: boolean;
  /** Where the profile picture is stored; see components/avatar.tsx. */
  avatarPath: string | null;
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

type Profile = { username: string; name: string; bio: string; avatar_path?: string | null; created_at: string };

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
  avatarPath: profile.avatar_path ?? null,
  automaticUsername: isAutomaticUsername(user, profile.username),
  joinedAt: Date.parse(profile.created_at),
  preferences: unsavedPreferences ?? toPreferences(user.user_metadata.preferences),
});

let userId: string | null | undefined;
const userListeners = new Set<(id: string | null) => void>();

/** Calls back with the signed-in person's id (null for guests) as soon as it's known, and whenever it changes. */
export function onUserChange(listener: (id: string | null) => void) {
  userListeners.add(listener);
  if (userId !== undefined) listener(userId);
}

let unsavedPreferences: Preferences | null = null;
let latestLoad = 0;

async function load(user: User | null) {
  const thisLoad = ++latestLoad;
  if (state.account?.id !== user?.id) unsavedPreferences = null;
  if (userId !== (user?.id ?? null)) {
    userId = user?.id ?? null;
    for (const listener of userListeners) listener(userId);
  }
  if (!user) { setState({ account: null, failed: false }); return; }
  if (state.account?.id !== user.id) setState({ account: undefined, failed: false });
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
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
  const { data, error } = await supabase.from("profiles").update(changes).eq("id", account.id).select("*").single<Profile>();
  if (error) return errorMessage(error);
  latestLoad++; // a load that started before this save would bring the old values back
  if (state.account?.id === account.id) setState({ account: {
    ...state.account, name: data.name, username: data.username, bio: data.bio,
    automaticUsername: state.account.automaticUsername && data.username === account.username,
  } });
  return null;
}

const PICTURES_NOT_SET_UP = "Profile pictures aren’t set up yet.";

async function saveAvatarPath(account: Account, path: string | null): Promise<string | null> {
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", account.id).select("id").single();
  if (error) return error.code === "PGRST204" ? PICTURES_NOT_SET_UP : errorMessage(error);
  latestLoad++;
  if (state.account?.id === account.id) setState({ account: { ...state.account, avatarPath: path } });
  // The old picture isn't used any more. If this fails, it goes when the account is deleted.
  if (account.avatarPath) void supabase.storage.from(AVATAR_BUCKET).remove([account.avatarPath]);
  return null;
}

export async function changeAvatar(file: File): Promise<string | null> {
  const { account } = state;
  if (!account) return SIGNED_OUT;
  let picture: Blob;
  try { picture = await prepareAvatar(file); } catch (error) { return (error as Error).message; }
  const bucket = supabase.storage.from(AVATAR_BUCKET);
  // A new name each time, so browsers never show an old picture they remember.
  const path = `${account.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await bucket.upload(path, picture, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) return /bucket not found/i.test(error.message) ? PICTURES_NOT_SET_UP : errorMessage(error);
  const problem = await saveAvatarPath(account, path);
  if (problem) void bucket.remove([path]);
  return problem;
}

export function removeAvatar(): Promise<string | null> {
  return state.account ? saveAvatarPath(state.account, null) : Promise.resolve(SIGNED_OUT);
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
  const { account } = state;
  if (!account) return SIGNED_OUT;
  // Pictures have to go first: Supabase doesn't delete accounts that still own files.
  const bucket = supabase.storage.from(AVATAR_BUCKET);
  const pictures = await bucket.list(account.id);
  if (pictures.error && !/bucket not found/i.test(pictures.error.message)) return errorMessage(pictures.error);
  if (pictures.data?.length) {
    const removed = await bucket.remove(pictures.data.map((picture) => `${account.id}/${picture.name}`));
    if (removed.error) return errorMessage(removed.error);
  }
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
