"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";

// Client-side gating for the simulated sign-in. On a static site this only controls what the
// UI shows; once real accounts exist, private data must also be protected where it is served.

/** Renders children for signed-in visitors. Guests go to /login and come back here afterwards. */
export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (session) { wasSignedIn.current = true; return; }
    if (session !== null) return; // still unknown
    if (wasSignedIn.current) { router.replace("/"); return; } // just logged out (here or in another tab)
    const here = window.location.pathname + window.location.search + window.location.hash;
    router.replace(`/login?next=${encodeURIComponent(here)}`);
  }, [session, router]);

  if (!session) return <div className="auth-pending" role="status">Opening your studio…</div>;
  return <>{children}</>;
}

/** Sends signed-in visitors away from guest pages (landing, log in, sign up). */
export function RedirectIfSignedIn({ to = "/home" }: { to?: string }) {
  const session = useSession();
  const router = useRouter();
  useEffect(() => { if (session) router.replace(to); }, [session, router, to]);
  return null;
}
