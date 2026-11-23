"use client";
import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RedirectIfSignedIn } from "@/components/auth-gate";
import { PASSWORD_MIN, resendConfirmation, safeNext, signIn, signUp } from "@/lib/session";

type Mode = "login" | "signup";

const copy = {
  login: { title: "Welcome back", lede: "Log in to pick up where you left off.", submit: "Log in", busy: "Logging in…", switchText: "New to Pintora?", switchLink: "Create a free account", switchHref: "/signup" },
  signup: { title: "Join Pintora", lede: "Create a free account to unlock every course, bookmark lessons, track your progress, and share your work.", submit: "Create account", busy: "Creating your account…", switchText: "Already have an account?", switchLink: "Log in", switchHref: "/login" },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  return <Suspense fallback={<AuthFormContent mode={mode} next={null} />}><AuthFormFromUrl mode={mode} /></Suspense>;
}

function AuthFormFromUrl({ mode }: { mode: Mode }) {
  return <AuthFormContent mode={mode} next={useSearchParams().get("next")} />;
}

function AuthFormContent({ mode, next }: { mode: Mode; next: string | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** The address waiting for its confirmation link to be opened. */
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const text = copy[mode];
  const switchHref = next ? `${text.switchHref}?next=${encodeURIComponent(next)}` : text.switchHref;

  // An expired or reused email link comes back with the problem in the URL's hash.
  useEffect(() => {
    if (new URLSearchParams(window.location.hash.slice(1)).has("error")) setError("That email link has expired or was already used. Log in to get a new one.");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (mode === "signup" && !name.trim()) { setError("Please tell us your name."); return; }
    setBusy(true); setError(null); setUnconfirmed(null);
    if (mode === "signup") {
      const result = await signUp({ name: name.trim(), email: cleanEmail, password, next });
      setError(result.error);
      if (result.confirmEmail) { setSent(true); setUnconfirmed(cleanEmail); }
    } else {
      const result = await signIn(cleanEmail, password);
      setError(result.error);
      if (result.unconfirmed) setUnconfirmed(cleanEmail);
    }
    setBusy(false);
    // On success RedirectIfSignedIn below navigates as soon as the session updates.
  }

  if (sent && unconfirmed) return <div className="auth-card">
    <RedirectIfSignedIn to={safeNext(next)} />
    <h1>Check your email</h1>
    <p className="auth-lede">We sent a link to <strong>{unconfirmed}</strong>. Open it to finish creating your account.</p>
    <ResendLink email={unconfirmed} next={next} />
    <p className="auth-switch">Already have an account with this email? <Link href={switchHref}>Log in</Link></p>
  </div>;

  return <div className="auth-card">
    <RedirectIfSignedIn to={safeNext(next)} />
    <h1>{text.title}</h1>
    <p className="auth-lede">{text.lede}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" placeholder="What should we call you?" required /></label>}
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
      <PasswordField label="Password" value={password} onChange={setPassword} isNew={mode === "signup"} />
      {mode === "login" && <Link className="auth-forgot" href="/forgot-password">Forgot your password?</Link>}
      <AuthMessage>{error}</AuthMessage>
      <button className="primary-btn" type="submit" disabled={busy}>{busy ? text.busy : text.submit}</button>
    </form>
    {unconfirmed && <ResendLink email={unconfirmed} next={next} />}
    <p className="auth-switch">{text.switchText} <Link href={switchHref}>{text.switchLink}</Link></p>
  </div>;
}

export function PasswordField({ label, value, onChange, isNew }: { label: string; value: string; onChange: (value: string) => void; isNew: boolean }) {
  return <label><span>{label}{isNew && <span className="auth-hint"> · at least {PASSWORD_MIN} characters</span>}</span>
    <input type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={isNew ? "new-password" : "current-password"} minLength={isNew ? PASSWORD_MIN : undefined} required />
  </label>;
}

/** Always in the page, so screen readers announce a message when it appears. */
export function AuthMessage({ children, kind = "error" }: { children: ReactNode; kind?: "error" | "info" }) {
  return <p className={`auth-message ${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</p>;
}

function ResendLink({ email, next }: { email: string; next: string | null }) {
  const [status, setStatus] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true); setStatus(null);
    const error = await resendConfirmation(email, next);
    setStatus(error ? { kind: "error", text: error } : { kind: "info", text: "Sent. It can take a minute to arrive." });
    setBusy(false);
  }

  return <div className="auth-resend">
    <button type="button" className="secondary-btn" onClick={resend} disabled={busy}>Send the link again</button>
    <AuthMessage kind={status?.kind ?? "info"}>{status?.text}</AuthMessage>
  </div>;
}
