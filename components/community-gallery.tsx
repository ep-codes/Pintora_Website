"use client";
import { useState } from "react";
import { works } from "@/lib/gallery";
export default function CommunityGallery() {
  const [topic, setTopic] = useState("All mediums");
  const [sort, setSort] = useState("Most recent");
  const [liked, setLiked] = useState<string[]>([]);
  const visibleWorks = works
    .filter((work) => topic === "All mediums" || work.medium === topic)
    .sort((a, b) => sort === "Most liked" ? b.likes - a.likes : works.indexOf(b) - works.indexOf(a));

  return <>
    <div className="community-toolbar">
      <div className="filter-tabs">{["All mediums", "Watercolor", "Drawing", "Acrylic", "Gouache"].map((medium) => <button key={medium} onClick={() => setTopic(medium)} aria-pressed={medium === topic} className={medium === topic ? "selected" : ""}>{medium}</button>)}</div>
      <select aria-label="Sort artwork" value={sort} onChange={(event) => setSort(event.target.value)}>
        <option>Most liked</option>
        <option>Most recent</option>
      </select>
    </div>
    <div className="community-grid">{visibleWorks.map((work) => <article className="creation" key={work.title}>
      <img src={`/art/${work.image}.svg`} alt={`${work.title}, a ${work.medium.toLowerCase()} study`} />
      <div className="creation-detail"><div><div className="eyebrow">{work.medium}</div><h2>{work.title}</h2><p>by {work.artist}</p></div>
        <button className={liked.includes(work.title) ? "liked" : ""} aria-label={`Appreciate ${work.title}`} aria-pressed={liked.includes(work.title)} onClick={() => setLiked(liked.includes(work.title) ? liked.filter((title) => title !== work.title) : [...liked, work.title])}>{liked.includes(work.title) ? "♥" : "♡"} {work.likes + (liked.includes(work.title) ? 1 : 0)}</button>
      </div>
    </article>)}</div>
  </>;
}
