"use client";
import Link from "next/link";
import LessonBrowser from "@/components/lesson-browser";
import { Icon, type IconName } from "@/components/icons";
import { courseSlug, featuredMediums } from "@/lib/courses";
import { lessons, type Lesson } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";
import { useSavedLessons } from "@/lib/saved";
import { useSession } from "@/lib/session";

const lessonHref = (lesson: Lesson) => `/learn?lesson=${lesson.id}#lessons`;

const shortcuts: { href: string; icon: IconName; title: string; body: string }[] = [
  { href: "/discussions", icon: "discussion", title: "Join a discussion", body: "Ask a question or share what you're working on." },
  { href: "/community", icon: "community", title: "Browse the gallery", body: "See what other artists are making this week." },
  { href: "/materials", icon: "materials", title: "Know your supplies", body: "A beginner's guide to the tools you need." },
];

// Signed-in home. Rendered inside RequireSession, so it only ever runs in the browser.
export default function Dashboard() {
  const session = useSession();
  const progress = useProgress() ?? {};
  const saved = useSavedLessons() ?? [];

  const firstName = session?.name.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const inProgress = lessons
    .filter((l) => progress[l.id] && !progress[l.id].completed)
    .sort((a, b) => progress[b.id].updatedAt - progress[a.id].updatedAt);
  const completedCount = lessons.filter((l) => progress[l.id]?.completed).length;
  const savedLessons = lessons.filter((l) => saved.includes(l.id));
  const current = inProgress[0];
  const nextUp = lessons.find((l) => !progress[l.id]) ?? lessons[0];

  return <>
    <section className="page-intro dashboard-intro">
      <div className="eyebrow">{today.toUpperCase()}</div>
      <h1>Welcome back{firstName && <>, <em>{firstName}.</em></>}</h1>
      <p>Pick up where you left off, or try something new today.</p>
    </section>

    <div className="dashboard-stats" role="list" aria-label="Your progress">
      <div className="stat-tile" role="listitem"><strong>{completedCount}<small> / {lessons.length}</small></strong><span>Lessons finished</span></div>
      <div className="stat-tile" role="listitem"><strong>{inProgress.length}</strong><span>In progress</span></div>
      <div className="stat-tile" role="listitem"><strong>{saved.length}</strong><span>Saved for later</span></div>
    </div>

    <section className="home-section" aria-labelledby="continue-heading">
      <div className="section-heading"><h2 className="subheading" id="continue-heading">{current ? "Continue learning" : "Start something new"}</h2></div>
      {current ? <ContinueCard lesson={current} step={progress[current.id].step} /> : <ContinueCard lesson={nextUp} step={null} />}
    </section>

    <section className="home-section" aria-labelledby="saved-heading">
      <div className="section-heading"><h2 className="subheading" id="saved-heading">Saved lessons</h2>{savedLessons.length > 0 && <Link className="view-all-link" href="/saved">View all</Link>}</div>
      {savedLessons.length
        ? <div className="mini-lesson-list">{savedLessons.slice(0, 3).map((l) => <Link className="mini-lesson" href={lessonHref(l)} key={l.id}><img src={`/art/${l.image}.svg`} alt="" /><span><strong>{l.title}</strong><small>{l.category} · {l.duration}</small></span></Link>)}</div>
        : <p className="dashboard-empty">Tap the bookmark on any lesson to keep it here.</p>}
    </section>

    <section className="home-section" aria-labelledby="mediums-heading">
      <div className="section-heading"><h2 className="subheading" id="mediums-heading">Explore by medium</h2><Link className="view-all-link" href="/learn">All courses</Link></div>
      <div className="home-category-grid">
        {featuredMediums.map(({ icon, label, course }) => <Link key={label} className="medium" href={`/learn/${courseSlug(course)}`}><span className="medium-icon">{icon}</span><span>{label}</span></Link>)}
      </div>
    </section>

    <section className="home-section lesson-section" aria-labelledby="trending-heading">
      <div className="section-heading"><h2 className="subheading" id="trending-heading">Trending tutorials</h2><Link className="view-all-link" href="/learn#lessons">View all</Link></div>
      <LessonBrowser compact />
    </section>

    <section className="home-section" aria-labelledby="community-heading">
      <div className="section-heading"><h2 className="subheading" id="community-heading">Around the studio</h2></div>
      <div className="dashboard-shortcuts">
        {shortcuts.map((s) => <Link className="shortcut-card" href={s.href} key={s.href}><Icon name={s.icon} /><span><strong>{s.title}</strong><small>{s.body}</small></span><span aria-hidden="true">→</span></Link>)}
      </div>
    </section>
  </>;
}

function ContinueCard({ lesson, step }: { lesson: Lesson; step: number | null }) {
  const percent = step === null ? 0 : Math.round((step / lesson.steps.length) * 100);
  return <div className="continue-learning">
    <img src={`/art/${lesson.image}.svg`} alt="" />
    <div className="continue-copy">
      <strong>{lesson.title}</strong>
      {step === null
        ? <p className="continue-hint">{lesson.category} · {lesson.duration} · {lesson.level}</p>
        : <div className="progress-row"><span className="progress-track" role="progressbar" aria-label={`${lesson.title} progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${percent}%` }} /></span><b>Step {step + 1} of {lesson.steps.length}</b></div>}
    </div>
    <Link className="continue-action" href={lessonHref(lesson)}>{step === null ? "Start" : "Continue"} <span>→</span></Link>
  </div>;
}
