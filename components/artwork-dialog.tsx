"use client";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import SymbolGlyph from "@/components/symbol-glyph";
import { addComment, COMMENT_MAX, deleteComment, toggleLikedWork, useComments, useLikedWorks } from "@/lib/community";
import type { Work } from "@/lib/gallery";
import { materials, materialSlug } from "@/lib/materials";
import { useSession } from "@/lib/session";

type ArtworkDialogProps = {
  /** The works to browse with previous / next, in gallery order. */
  works: Work[];
  openId: string | null;
  startAt: "artwork" | "comments";
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function ArtworkDialog({ works, openId, startAt, onSelect, onClose }: ArtworkDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const index = works.findIndex((work) => work.id === openId);
  const work = index >= 0 ? works[index] : null;

  useEffect(() => {
    if (!openId) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    const comments = startAt === "comments" ? scroller.current?.querySelector(".art-comments") : null;
    if (comments) comments.scrollIntoView({ block: "start" });
    else scroller.current?.scrollTo(0, 0);
  }, [openId, startAt]);

  const step = (offset: number) => onSelect(works[(index + offset + works.length) % works.length].id);

  function onKeyDown(event: KeyboardEvent) {
    if (works.length < 2 || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
  }

  return <dialog ref={dialog} className="art-dialog" aria-labelledby={headingId} onClose={onClose} onKeyDown={onKeyDown} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
    {work && <>
      <button type="button" className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Close artwork">×</button>
      <div className="art-scroll" ref={scroller}>
        <div className="art-top">
          <div className="art-stage">
            <img src={`/art/${work.image}.svg`} alt={`${work.title}, a ${work.medium.toLowerCase()} study by ${work.artist}`} />
            {works.length > 1 && <>
              <button type="button" className="art-step art-step-previous" onClick={() => step(-1)} aria-label="Previous artwork">←</button>
              <button type="button" className="art-step art-step-next" onClick={() => step(1)} aria-label="Next artwork">→</button>
              <span className="art-position" aria-hidden="true">{index + 1} / {works.length}</span>
            </>}
          </div>
          <ArtworkInfo work={work} headingId={headingId} />
        </div>
        {/* key clears a half-written comment when moving to another artwork */}
        <Comments work={work} key={work.id} />
      </div>
    </>}
  </dialog>;
}

function ArtworkInfo({ work, headingId }: { work: Work; headingId: string }) {
  const isLiked = (useLikedWorks() ?? []).includes(work.id);
  return <div className="art-info">
    <div className="eyebrow">{work.medium}</div>
    <h2 id={headingId}>{work.title}</h2>
    <div className="art-artist"><Initial name={work.artist} /><span><strong>{work.artist}</strong><small>@{work.username}</small></span></div>
    <p className="art-caption">{work.caption}</p>
    <h3>Materials</h3>
    <ul className="art-materials">
      {work.materials.map((name) => {
        const material = materials.find((m) => m.name === name);
        return <li key={name}>
          <span className="art-material-icon" aria-hidden="true">{material ? <SymbolGlyph value={material.icon} /> : "•"}</span>
          {material ? <Link href={`/materials#${materialSlug(name)}`}>{name}</Link> : name}
        </li>;
      })}
    </ul>
    <button type="button" className={`creation-action art-like${isLiked ? " liked" : ""}`} aria-label={`Appreciate ${work.title}, ${work.likes + (isLiked ? 1 : 0)} so far`} aria-pressed={isLiked} onClick={() => toggleLikedWork(work.id)}>
      <Icon name="heart" />{isLiked ? "Appreciated" : "Appreciate"} · {work.likes + (isLiked ? 1 : 0)}
    </button>
  </div>;
}

function Comments({ work }: { work: Work }) {
  const account = useSession();
  const own = (useComments() ?? []).filter((comment) => comment.workId === work.id);
  const [text, setText] = useState("");
  const headingId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!account || !text.trim()) return;
    addComment(work.id, account, text.trim());
    setText("");
  }

  return <section className="art-comments" aria-labelledby={headingId}>
    <h3 id={headingId}>Comments <span>{own.length + work.comments.length}</span></h3>
    {account && <form className="art-comment-form" onSubmit={submit}>
      <Initial name={account.name} />
      <div>
        <textarea aria-label={`Comment on ${work.title}`} placeholder="Share a kind word or ask a question…" rows={2} maxLength={COMMENT_MAX} value={text} onChange={(e) => setText(e.target.value)} required />
        <div className="art-comment-actions">
          <small>Preview comments · Yours are saved on this device only.</small>
          <button type="submit" className="primary-btn" disabled={!text.trim()}>Post</button>
        </div>
      </div>
    </form>}
    <ul className="art-comment-list">
      {own.map((comment) => {
        const mine = comment.authorId === account?.id;
        // Your own comments follow your current name; others keep the one they were posted with.
        const author = mine ? account : comment;
        return <li key={comment.id}>
          <Initial name={author.name} />
          <div>
            <div className="art-comment-meta"><strong>{author.name}</strong><span>@{author.username}</span><span>{timeAgo(comment.createdAt)}</span>
              {mine && <button type="button" className="art-comment-delete" onClick={() => deleteComment(comment.id)} aria-label={`Delete your comment: ${comment.text}`}>Delete</button>}
            </div>
            <p>{comment.text}</p>
          </div>
        </li>;
      })}
      {work.comments.map((comment) => <li key={comment.text}>
        <Initial name={comment.name} />
        <div><div className="art-comment-meta"><strong>{comment.name}</strong><span>@{comment.username}</span><span>{comment.when}</span></div><p>{comment.text}</p></div>
      </li>)}
    </ul>
  </section>;
}

function Initial({ name }: { name: string }) {
  return <span className="art-initial" aria-hidden="true">{name.trim().charAt(0).toUpperCase() || "·"}</span>;
}

function timeAgo(time: number) {
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "Just now";
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return format.format(-minutes, "minute");
  if (minutes < 60 * 24) return format.format(-Math.floor(minutes / 60), "hour");
  if (minutes < 60 * 24 * 7) return format.format(-Math.floor(minutes / (60 * 24)), "day");
  return new Date(time).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}
