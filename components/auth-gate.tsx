"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { reloadSession, signOut, useRecovering, useSession, useSessionFailed } from "@/lib/session";
import { loadUserData, useUserData, useUserDataFailed } from "@/lib/user-data";

// On a static site this only controls what the UI shows. What people can actually read or change
// is enforced by Supabase's Row Level Security.

/** Renders children for signed-in visitors, once their data is here. Guests go to /login and come back afterwards. */
export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession();
  const sessionFailed = useSessionFailed();
  const dataFailed = useUserDataFailed();
  const hasData = useUserData(() => true);
  const ready = session && hasData;
  const router = useRouter();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (session) { wasSignedIn.current = true; return; }
    if (session !== null) return; // still unknown
    if (wasSignedIn.current) { router.replace("/"); return; } // just logged out (here or in another tab)
    const here = window.location.pathname + window.location.search + window.location.hash;
    router.replace(`/login?next=${encodeURIComponent(here)}`);
  }, [session, router]);

  if ((sessionFailed || dataFailed) && !ready) return <div className="auth-pending"><div role="alert">
    <p>We couldn’t open your studio. Check your connection and try again.</p>
    <button type="button" className="primary-btn" onClick={() => { void reloadSession(); void loadUserData(); }}>Try again</button>{" "}
    <button type="button" className="secondary-btn" onClick={signOut}>Log out</button>
  </div></div>;
  if (!ready) return <div className="auth-pending" role="status">Opening your studio…</div>;
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
