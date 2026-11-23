"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Dashboard", icon: "home" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/materials", label: "Materials", icon: "materials" },
  { href: "/community", label: "Community", icon: "community" },
  { href: "/discussions", label: "Discussions", icon: "discussion" },
];

// Profile, Settings and Log out are in the account menu (components/profile-menu.tsx).
export default function SiteNavigation() {
  const pathname = usePathname();
  // Section links stay highlighted on their sub-pages, e.g. Learn on /learn/watercolor.
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return <aside className="sidebar">
    <Link className="brand" href="/home" aria-label="Pintora dashboard"><Logo /></Link>
    <nav className="nav" aria-label="Main navigation">
      {links.map((link) => <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : ""}><Icon name={link.icon} />{link.label}</Link>)}
      <div className="nav-divider" />
      <Link href="/saved" className={isActive("/saved") ? "active" : ""}><Icon name="saved" />Bookmarks</Link>
    </nav>
    <div className="sidebar-bottom">Made for artists, by artists.</div>
  </aside>;
}
