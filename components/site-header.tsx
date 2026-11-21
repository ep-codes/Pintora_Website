"use client";
import { useSession } from "@/lib/session";

export default function SiteHeader() {
  const session = useSession();
  const initial = session?.name.trim().charAt(0).toUpperCase() || "·";
  return <header className="topbar">
    <form className="search-wrap" action="/learn"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input className="search" name="q" type="search" placeholder="Search for lessons, topics, or artists…" aria-label="Search lessons" /></form>
    <button className="notification" type="button" aria-label="Notifications"><span>•</span>♧</button>
    <div className="avatar" role="img" aria-label={session ? `Signed in as ${session.name}` : "Your profile"} title={session?.name}>{initial}</div>
  </header>;
}
