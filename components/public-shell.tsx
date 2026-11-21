import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

// Layout for logged-out pages: landing, log in, sign up.
export default function PublicShell({ children }: { children: ReactNode }) {
  return <div className="public-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="public-topbar">
      <Link className="brand" href="/" aria-label="Pintora home"><span className="brand-mark" aria-hidden="true">✎</span><strong>Pintora</strong></Link>
      <nav className="public-nav" aria-label="Main navigation">
        <Link className="public-nav-section" href="/#try">Free lessons</Link>
        <Link className="public-nav-section" href="/#how">How it works</Link>
        <ThemeToggle />
        <Link href="/login">Log in</Link>
        <Link className="primary-btn" href="/signup">Join free</Link>
      </nav>
    </header>
    <main id="main" className="public-main">{children}</main>
    <footer className="footer public-footer"><span>© 2026 Pintora</span><span>Made for the joy of making.</span><Link href="/signup">Join the community ↗</Link></footer>
  </div>;
}
