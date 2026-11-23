"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { reloadSession, signOut, useRecovering, useSession, useSessionFailed } from "@/lib/session";

// On a static site this only controls what the UI shows. What people can actually read or change
// is enforced by Supabase's Row Level Security.

/** Renders children for signed-in visitors. Guests go to /login and come back here afterwards. */
export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession();
  const failed = useSessionFailed();
  const router = useRouter();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (session) { wasSignedIn.current = true; return; }
    if (session !== null) return; // still unknown
    if (wasSignedIn.current) { router.replace("/"); return; } // just logged out (here or in another tab)
    const here = window.location.pathname + window.location.search + window.location.hash;
    router.replace(`/login?next=${encodeURIComponent(here)}`);
  }, [session, router]);

  if (failed && !session) return <div className="auth-pending"><div role="alert">
    <p>We couldn’t open your studio. Check your connection and try again.</p>
    <button type="button" className="primary-btn" onClick={reloadSession}>Try again</button>{" "}
    <button type="button" className="secondary-btn" onClick={signOut}>Log out</button>
  </div></div>;
  if (!session) return <div className="auth-pending" role="status">Opening your studio…</div>;
  return <>{children}</>;
}

/** Sends signed-in visitors away from guest pages (landing, log in, sign up). */
export function RedirectIfSignedIn({ to = "/home" }: { to?: string }) {
  const session = useSession();
  const recovering = useRecovering();
  const router = useRouter();
  // A reset link that lands elsewhere on the site still asks for the new password.
  useEffect(() => { if (recovering) router.replace("/reset-password"); else if (session) router.replace(to); }, [session, recovering, router, to]);
  return null;
}
