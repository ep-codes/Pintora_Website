"use client";
import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RedirectIfSignedIn } from "@/components/auth-gate";
import { safeNext, signIn } from "@/lib/session";

type Mode = "login" | "signup";

const copy = {
  login: { title: "Welcome back", lede: "Log in to pick up where you left off.", submit: "Log in", switchText: "New to Pintora?", switchLink: "Create a free account", switchHref: "/signup" },
  signup: { title: "Join Pintora", lede: "Create a free account to unlock every course, bookmark lessons, track your progress, and share your work.", submit: "Create account", switchText: "Already have an account?", switchLink: "Log in", switchHref: "/login" },
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
  const text = copy[mode];
  const switchHref = next ? `${text.switchHref}?next=${encodeURIComponent(next)}` : text.switchHref;

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    // Simulated: the password field is never read or stored. Logging in to an email this browser
    // already knows restores that account; otherwise a new account is created.
    signIn({ email: cleanEmail, name: mode === "signup" ? name : undefined });
    // RedirectIfSignedIn below navigates as soon as the session updates.
  }

  return <div className="auth-card">
    <RedirectIfSignedIn to={safeNext(next)} />
    <h1>{text.title}</h1>
    <p className="auth-lede">{text.lede}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="What should we call you?" required /></label>}
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
      <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} required /></label>
      <button className="primary-btn" type="submit">{text.submit}</button>
    </form>
    <p className="auth-preview-note">Preview sign-in: accounts aren't connected yet. Nothing is sent anywhere and your password isn't stored.</p>
    <p className="auth-switch">{text.switchText} <Link href={switchHref}>{text.switchLink}</Link></p>
  </div>;
}
