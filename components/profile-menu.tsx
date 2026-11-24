"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar, { AvatarContent } from "@/components/avatar";
import { Icon, type IconName } from "@/components/icons";
import { signOut, useSession, type Account } from "@/lib/session";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/settings", label: "Settings", icon: "settings" },
];
const isOn = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

// The avatar at the top right: who is signed in, and the account links. The sidebar only has the
// site's sections, so nothing is listed in both.
export default function ProfileMenu() {
  const account = useSession();
  return account ? <Menu account={account} /> : null;
}

function Menu({ account }: { account: Account }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const isOutside = (target: EventTarget | null) => target instanceof Node && !root.current?.contains(target);
    const onPointer = (event: Event) => { if (isOutside(event.target)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onPointer); // tabbing past the end
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return <div className="profile-menu" ref={root}>
    <button type="button" className={links.some((link) => isOn(pathname, link.href)) ? "avatar active" : "avatar"} ref={button} aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={`Your account (${account.name})`} title="Your account" onClick={() => setOpen(!open)}><AvatarContent name={account.name} path={account.avatarPath} /></button>
    {open && <div className="profile-menu-panel" id={panelId} role="group" aria-label="Your account"><Panel account={account} close={() => setOpen(false)} /></div>}
  </div>;
}

function Panel({ account, close }: { account: Account; close: () => void }) {
  const pathname = usePathname();
  return <>
    <div className="profile-menu-head">
      <Avatar className="avatar" name={account.name} path={account.avatarPath} />
      <span className="profile-menu-name"><strong>{account.name}</strong><small>@{account.username}</small></span>
    </div>

    <nav className="profile-menu-links" aria-label="Account">
      {links.map(({ href, label, icon }) => <Link key={href} href={href} className={isOn(pathname, href) ? "active" : ""} aria-current={pathname === href ? "page" : undefined} onClick={close}><Icon name={icon} />{label}</Link>)}
    </nav>

    {/* RequireSession sends the visitor to the landing page once the session clears. */}
    <button type="button" className="profile-menu-logout" onClick={signOut}><Icon name="logout" />Log out</button>
  </>;
}
