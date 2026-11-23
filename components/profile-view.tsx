"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { lessonHref, lessons } from "@/lib/lessons";
import { useSavedLessons } from "@/lib/saved";
import { useSession, type Account } from "@/lib/session";

// Uploading artwork and following artists don't exist yet, so these are honestly zero.
// Replace them with real counts when those features arrive.
const stats = [
  { label: "Artworks", value: 0 },
  { label: "Following", value: 0 },
  { label: "Followers", value: 0 },
];

const tabs = [
  { id: "artworks", label: "Artworks", icon: "artworks" },
  { id: "saved", label: "Saved", icon: "saved" },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];
type TabId = (typeof tabs)[number]["id"];

const PLACEHOLDER_TILES = 9;

// The signed-in artist's profile. Rendered inside RequireSession.
export default function ProfileView() {
  const account = useSession();
  return account ? <ProfileContent account={account} /> : null;
}

function ProfileContent({ account }: { account: Account }) {
  return <div className="profile-page">
    <h1 className="profile-title">Profile</h1>

    <section className="profile-hero" aria-label="Your profile">
      <div className="profile-avatar" aria-hidden="true">{account.name.trim().charAt(0).toUpperCase() || "·"}</div>
      <div className="profile-identity">
        <h2>{account.name}</h2>
        <p>@{account.username}</p>
      </div>
      <dl className="profile-stats">
        {stats.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {account.bio
        ? <p className="profile-bio">{account.bio}</p>
        : <p className="profile-bio profile-bio-empty">Add a short bio about yourself and your interests…</p>}
      <div className="profile-actions">
        <Link className="profile-btn" href="/profile/edit">Edit Profile</Link>
        <ShareButton account={account} />
      </div>
    </section>

    <ProfileTabs />
  </div>;
}

function ShareButton({ account }: { account: Account }) {
  const [status, setStatus] = useState("");

  async function share() {
    // Profiles aren't public pages yet, so this shares the site along with the artist's username.
    const text = `Find ${account.name} (@${account.username}) on Pintora`;
    const url = window.location.origin;
    setStatus("");
    if (navigator.share) {
      try { await navigator.share({ title: "Pintora", text, url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; } // closed the share sheet
    }
    try { await navigator.clipboard.writeText(`${text}: ${url}`); setStatus("Copied to clipboard"); }
    catch { setStatus("Couldn't copy"); }
  }

  return <>
    <button type="button" className="profile-btn profile-btn-icon" onClick={share} aria-label="Share profile" title="Share profile"><Icon name="share" /></button>
    <span role="status" className="profile-share-status">{status}</span>
  </>;
}

function ProfileTabs() {
  const [active, setActive] = useState<TabId>("artworks");
  const buttons = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  function onKeyDown(event: KeyboardEvent) {
    const index = tabs.findIndex((tab) => tab.id === active);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const { id } = tabs[(next + tabs.length) % tabs.length];
    setActive(id);
    buttons.current[id]?.focus();
  }

  return <section className="profile-collection" aria-label="Your collection">
    <div className="profile-tabs" role="tablist" aria-label="Your collection" onKeyDown={onKeyDown}>
      {tabs.map(({ id, label, icon }) => <button type="button" role="tab" key={id} id={`profile-tab-${id}`} aria-controls={`profile-panel-${id}`}
        aria-selected={active === id} tabIndex={active === id ? 0 : -1} ref={(element) => { buttons.current[id] = element; }} onClick={() => setActive(id)}>
        <Icon name={icon} />{label}
      </button>)}
    </div>
    {tabs.map(({ id }) => <div role="tabpanel" key={id} id={`profile-panel-${id}`} aria-labelledby={`profile-tab-${id}`} hidden={active !== id}>
      {id === "artworks" ? <ArtworksPanel /> : <SavedPanel />}
    </div>)}
  </section>;
}

function ArtworksPanel() {
  return <EmptyGrid title="Your artworks will hang here." body="Sharing your own work isn't available yet. Until then, a little practice goes a long way." action="Find a lesson" />;
}

function SavedPanel() {
  const saved = useSavedLessons() ?? [];
  const savedLessons = lessons.filter((lesson) => saved.includes(lesson.id));
  if (!savedLessons.length) return <EmptyGrid title="Nothing saved yet." body="Tap the bookmark on any lesson to keep it here." action="Browse lessons" />;
  return <div className="profile-grid">
    {savedLessons.map((lesson) => <Link className="profile-tile" href={lessonHref(lesson)} key={lesson.id}>
      <img src={`/art/${lesson.image}.svg`} alt="" />
      <span className="profile-tile-caption"><strong>{lesson.title}</strong><small>{lesson.category} · {lesson.duration}</small></span>
    </Link>)}
  </div>;
}

function EmptyGrid({ title, body, action }: { title: string; body: string; action: string }) {
  return <div className="profile-empty">
    <div className="profile-grid" aria-hidden="true">{Array.from({ length: PLACEHOLDER_TILES }, (_, i) => <div className="profile-tile" key={i} />)}</div>
    <div className="profile-empty-note">
      <h3>{title}</h3>
      <p>{body}</p>
      <Link className="secondary-btn" href="/learn#lessons">{action} →</Link>
    </div>
  </div>;
}
