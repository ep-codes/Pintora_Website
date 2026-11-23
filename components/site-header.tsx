import ProfileMenu from "@/components/profile-menu";
import ThemeToggle from "@/components/theme-toggle";

export default function SiteHeader() {
  return <header className="topbar">
    <form className="search-wrap" action="/learn"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input className="search" name="q" type="search" placeholder="Search for lessons, topics, or artists…" aria-label="Search lessons" /></form>
    <ThemeToggle />
    <ProfileMenu />
  </header>;
}
