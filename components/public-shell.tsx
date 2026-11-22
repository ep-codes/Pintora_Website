import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

// Layout for logged-out pages: landing, log in, sign up.
export default function PublicShell({ children }: { children: ReactNode }) {
  return <div className="public-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="public-topbar">
      <Link className="brand" href="/" aria-label="Pintora home"><Logo markOnNarrow /></Link>
      <nav className="public-nav" aria-label="Main navigation">
        <Link className="public-nav-section" href="/#try">Free lessons</Link>
        <Link className="public-nav-section" href="/#how">How it works</Link>
        <Link href="/login">Log in</Link>
        <Link className="primary-btn" href="/signup">Join free</Link>
        <ThemeToggle />
      </nav>
    </header>
    {/* On wide screens the toggle moves out of the bar into the window's top-right corner;
        CSS shows exactly one of the two (see .public-theme-corner). */}
    <div className="public-theme-corner"><ThemeToggle /></div>
    <main id="main" className="public-main">{children}</main>
    <footer className="footer public-footer"><span>© 2026 Pintora</span><span>Made for the joy of making.</span><Link href="/signup">Join the community ↗</Link></footer>
  </div>;
}
