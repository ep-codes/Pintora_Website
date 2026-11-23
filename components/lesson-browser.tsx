"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { lessons, type Lesson } from "@/lib/lessons";
import { Icon } from "@/components/icons";
import { useSession } from "@/lib/session";
import { toggleSavedLesson, useSavedLessons } from "@/lib/saved";
import { getLessonProgress, markLessonCompleted, recordLessonStep } from "@/lib/progress";

const mediums = ["All mediums", "Drawing", "Watercolor", "Acrylic", "Digital Art", "Gouache"];

type LessonBrowserProps = {
  /** 3-lesson teaser without filters (landing page and dashboard). */
  compact?: boolean;
  /** Only bookmarked lessons, without the saved toggle (/saved page). */
  savedOnly?: boolean;
};

export default function LessonBrowser({ compact = false, savedOnly = false }: LessonBrowserProps) {
  return <Suspense fallback={<p>Getting your lessons ready…</p>}><LessonBrowserContent compact={compact} savedOnly={savedOnly} /></Suspense>;
}

function LessonBrowserContent({ compact, savedOnly }: Required<LessonBrowserProps>) {
  const parameters = useSearchParams().toString();
  const router = useRouter();
  const session = useSession();
  const saved = useSavedLessons() ?? [];
  const [category, setCategory] = useState("All mediums");
  const [query, setQuery] = useState("");
  const [onlySaved, setOnlySaved] = useState(savedOnly);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);

  function open(lesson: Lesson, startStep = 0) {
    setSelected(lesson);
    setStep(startStep);
    recordLessonStep(lesson.id, startStep);
    if (!dialog.current?.open) dialog.current?.showModal();
  }

  function goToStep(next: number) {
    if (!selected) return;
    setStep(next);
    recordLessonStep(selected.id, next);
  }

  function finish() {
    if (selected) markLessonCompleted(selected.id, selected.steps.length);
    dialog.current?.close();
  }

  function toggleSave(id: string) {
    toggleSavedLesson(id);
    // Saving is a member feature: a guest keeps the bookmark and is invited to join to see it in Saved.
    if (session === null && !saved.includes(id)) router.push("/signup?next=/saved");
  }

  useEffect(() => {
    const params = new URLSearchParams(parameters);
    setQuery(params.get("q") || "");
    // ?lesson=<id> opens that lesson where the learner left off (the dashboard's Continue button).
    const requested = compact ? undefined : lessons.find((lesson) => lesson.id === params.get("lesson"));
    if (requested) {
      const progress = getLessonProgress(requested.id);
      open(requested, progress && !progress.completed ? progress.step : 0);
    }
  }, [parameters, compact]); // only react to URL changes

  const visible = lessons
    .filter((l) => (compact || category === "All mediums" || l.category === category)
      && (!onlySaved || saved.includes(l.id))
      && `${l.title} ${l.category} ${l.teacher}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, compact ? 3 : lessons.length);
  const isLastStep = selected ? step === selected.steps.length - 1 : false;

  return <>
    <div className={compact ? "hidden" : "lesson-controls"}>
      <div className="filter-tabs" aria-label="Filter lessons by medium">
        {mediums.map((c) => <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={category === c ? "selected" : ""}>{c}</button>)}
      </div>
      <div className="filter-row">
        <input aria-label="Filter lesson titles" placeholder="Search lessons…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {!savedOnly && <button className={onlySaved ? "save-filter selected" : "save-filter"} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Icon name="saved" /> Bookmarks</button>}
        <span>{visible.length} lessons</span>
      </div>
    </div>

    <div className="lesson-grid">
      {visible.map((l) => {
        const isSaved = saved.includes(l.id);
        return <article className="lesson-card" key={l.id}>
          <div className="lesson-image">
            <button className="image-open" onClick={() => open(l)} aria-label={`Open ${l.title}`}><img src={`/art/${l.image}.svg`} alt={l.title} /><span className="lesson-duration">◷ {l.duration}</span><span className="play-icon">↗</span></button>
            <button className={`bookmark ${isSaved ? "is-saved" : ""}`} aria-label={`Bookmark ${l.title}`} aria-pressed={isSaved} onClick={() => toggleSave(l.id)}><Icon name="saved" /></button>
          </div>
          <div className="lesson-details">
            <div className="lesson-meta"><span>{l.category}</span><span>•</span><span>{l.level}</span></div>
            <h3><button onClick={() => open(l)}>{l.title}</button></h3>
            <p>{l.teacher}<span>↗</span></p>
          </div>
        </article>;
      })}
    </div>

    {!visible.length && <div className="empty-state">
      <h3>A little room for discovery.</h3>
      <p>{onlySaved ? "Tap the bookmark on any lesson to collect it here." : "No lessons match yet. Try another medium or search."}</p>
      {savedOnly
        ? <Link className="secondary-btn" href="/learn#lessons">Browse all lessons →</Link>
        : <button className="secondary-btn" onClick={() => { setQuery(""); setCategory("All mediums"); setOnlySaved(false); }}>Browse all lessons →</button>}
    </div>}

    <dialog ref={dialog} className="lesson-dialog" aria-label={selected?.title || "Guided art practice"} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Close lesson">×</button>
      {selected && <>
        <img className="dialog-art" src={`/art/${selected.image}.svg`} alt="" />
        <div className="dialog-content">
          <div className="eyebrow">{selected.category} · {selected.duration} · {selected.level}</div>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <div className="step-counter">YOUR PRACTICE · STEP {step + 1} OF {selected.steps.length}</div>
          <p className="lesson-instruction">{selected.steps[step]}</p>
          <div className="step-progress">{selected.steps.map((_, i) => <span className={i <= step ? "done" : ""} key={i} />)}</div>
          <div className="dialog-actions">
            <button className="secondary-btn" disabled={step === 0} onClick={() => goToStep(step - 1)}>← Previous</button>
            <button className="primary-btn" onClick={() => (isLastStep ? finish() : goToStep(step + 1))}>{isLastStep ? "Finish practice ✓" : "Next step →"}</button>
          </div>
          <small>Take your time. The joy is in the making.</small>
        </div>
      </>}
    </dialog>
  </>;
}
