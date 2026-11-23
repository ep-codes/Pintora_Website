"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthMessage, PasswordField } from "@/components/auth-form";
import { requestPasswordReset, resetPassword, useRecovering, useSession, useSessionFailed } from "@/lib/session";

/** Step 1: ask for a reset email (/forgot-password). */
export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    const problem = await requestPasswordReset(email.trim());
    if (problem) setError(problem); else setSentTo(email.trim());
    setBusy(false);
  }

  // The same message whether or not the account exists, so this page can't be used to look people up.
  if (sentTo) return <div className="auth-card">
    <h1>Check your email</h1>
    <p className="auth-lede">If there’s a Pintora account for <strong>{sentTo}</strong>, we sent a link to reset its password.</p>
    <p className="auth-switch"><Link href="/login">Back to log in</Link></p>
  </div>;

  return <div className="auth-card">
    <h1>Reset your password</h1>
    <p className="auth-lede">Enter your email and we’ll send you a link to choose a new one.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
      <AuthMessage>{error}</AuthMessage>
      <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>
    <p className="auth-switch">Remembered it? <Link href="/login">Log in</Link></p>
  </div>;
}

/** Step 2: the emailed link lands here, already signed in (/reset-password). */
export function ResetPassword() {
  const router = useRouter();
  const account = useSession();
  const failed = useSessionFailed();
  const recovering = useRecovering();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    const problem = await resetPassword(password);
    if (problem) { setError(problem); setBusy(false); } else router.replace("/home");
  }

  if (!recovering && !busy) {
    if (account === undefined && !failed) return <div className="auth-card"><p className="auth-lede" role="status">Checking your link…</p></div>;
    return <div className="auth-card">
      <h1>This link doesn’t work</h1>
      <p className="auth-lede">It may have expired or already been used.{account && <> You’re logged in, so you can also change your password in <Link href="/settings">Settings</Link>.</>}</p>
      <Link className="primary-btn" href="/forgot-password">Send a new link</Link>
    </div>;
  }

  return <div className="auth-card">
    <h1>Choose a new password</h1>
    <p className="auth-lede">You’ll stay logged in on this device.</p>
    <form className="auth-form" onSubmit={submit}>
      <PasswordField label="New password" value={password} onChange={setPassword} isNew />
      <AuthMessage>{error}</AuthMessage>
      <button className="primary-btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
    </form>
  </div>;
}
