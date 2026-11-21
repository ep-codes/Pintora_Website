"use client";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useSession } from "@/lib/session";

export default function SiteHeader() {
  const session = useSession();
  const initial = session?.name.trim().charAt(0).toUpperCase() || "·";
  return <header className="topbar">
    <form className="search-wrap" action="/learn"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input className="search" name="q" type="search" placeholder="Search for lessons, topics, or artists…" aria-label="Search lessons" /></form>
    <ThemeToggle />
    <Link className="avatar" href="/profile" aria-label={session ? `Your profile (${session.name})` : "Your profile"} title="Profile and settings">{initial}</Link>
  </header>;
}
