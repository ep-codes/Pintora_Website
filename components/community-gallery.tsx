"use client";
import { useState } from "react";
import ArtworkDialog from "@/components/artwork-dialog";
import { Icon } from "@/components/icons";
import { toggleLikedWork, toggleSavedWork, useLikedWorks, useSavedWorks, useWorkStats } from "@/lib/community";
import { works, type Work } from "@/lib/gallery";

const mediums = ["All mediums", "Watercolor", "Drawing", "Acrylic", "Gouache"];

export default function CommunityGallery() {
  const [topic, setTopic] = useState("All mediums");
  const [sort, setSort] = useState("Most recent");
  const [open, setOpen] = useState<{ id: string; at: "artwork" | "comments" } | null>(null);
  const liked = useLikedWorks() ?? [];
  const saved = useSavedWorks() ?? [];
  const stats = useWorkStats() ?? {};
  // Your own like doesn't count for sorting, so artworks don't jump around when you click.
  const likesFromOthers = (work: Work) => work.likes + (stats[work.id]?.likes ?? 0) - (stats[work.id] && liked.includes(work.id) ? 1 : 0);
  const visibleWorks = works
    .filter((work) => topic === "All mediums" || work.medium === topic)
    .sort((a, b) => sort === "Most liked" ? likesFromOthers(b) - likesFromOthers(a) : works.indexOf(b) - works.indexOf(a));

  return <>
    <div className="community-toolbar">
      <div className="filter-tabs">{mediums.map((medium) => <button key={medium} onClick={() => setTopic(medium)} aria-pressed={medium === topic} className={medium === topic ? "selected" : ""}>{medium}</button>)}</div>
      <select aria-label="Sort artwork" value={sort} onChange={(event) => setSort(event.target.value)}>
        <option>Most liked</option>
        <option>Most recent</option>
      </select>
    </div>
    <div className="community-grid">{visibleWorks.map((work) => {
      const isLiked = liked.includes(work.id);
      const isSaved = saved.includes(work.id);
      const commentCount = work.comments.length + (stats[work.id]?.comments ?? 0);
      const openArtwork = () => setOpen({ id: work.id, at: "artwork" });
      return <article className="creation creation-interactive" key={work.id}>
        <button type="button" className="creation-open" onClick={openArtwork} aria-label={`View ${work.title}`} aria-haspopup="dialog">
          <img src={`/art/${work.image}.svg`} alt={`${work.title}, a ${work.medium.toLowerCase()} study`} />
        </button>
        <div className="creation-detail"><div><div className="eyebrow">{work.medium}</div><h2><button type="button" className="creation-title" onClick={openArtwork}>{work.title}</button></h2><p>by {work.artist}</p></div></div>
        <div className="creation-actions">
          <button type="button" className={`creation-action${isLiked ? " liked" : ""}`} aria-label={`Appreciate ${work.title}`} aria-pressed={isLiked} onClick={() => toggleLikedWork(work.id)}><Icon name="heart" />{work.likes + (stats[work.id]?.likes ?? (isLiked ? 1 : 0))}</button>
          <button type="button" className="creation-action" aria-label={`${commentCount} ${commentCount === 1 ? "comment" : "comments"} on ${work.title}`} aria-haspopup="dialog" onClick={() => setOpen({ id: work.id, at: "comments" })}><Icon name="discussion" />{commentCount}</button>
          <button type="button" className={`creation-action creation-save${isSaved ? " saved" : ""}`} aria-label={`Save ${work.title}`} title={isSaved ? "Saved to your profile" : "Save to your profile"} aria-pressed={isSaved} onClick={() => toggleSavedWork(work.id)}><Icon name="saved" /></button>
        </div>
      </article>;
    })}</div>

    <ArtworkDialog works={visibleWorks} openId={open?.id ?? null} startAt={open?.at ?? "artwork"} onSelect={(id) => setOpen({ id, at: "artwork" })} onClose={() => setOpen(null)} />
  </>;
}
