"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

type NavigationLink = {
  href: string;
  label: string;
  icon: IconName;
};

const primaryLinks: NavigationLink[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "#", label: "Explore", icon: "explore" },
  { href: "/materials", label: "Materials", icon: "materials" },
  { href: "/community", label: "Community", icon: "community" }
];
const secondaryLinks: NavigationLink[] = [
  { href: "#", label: "Profile", icon: "profile" },
  { href: "#", label: "Saved", icon: "saved" }
];

function NavLink({ href, label, icon, active }: NavigationLink & { active: boolean }) {
  return <Link href={href} className={active ? "active" : undefined}><Icon name={icon} />{label}</Link>;
}

export default function SiteNavigation() {
  const pathname = usePathname();

  return <aside className="sidebar">
    <Link className="brand" href="/"><strong>Pintora</strong></Link>
    <nav className="nav" aria-label="Main navigation">
      {primaryLinks.map((link) => <NavLink key={link.label} {...link} active={link.href !== "#" && pathname === link.href} />)}
      <hr className="separator" />
      {secondaryLinks.map((link) => <NavLink key={link.label} {...link} active={false} />)}
    </nav>
  </aside>;
}