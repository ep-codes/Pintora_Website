"use client";
import { useState } from "react";
import { materials, materialTypes, type MaterialType } from "@/lib/materials";
import SymbolGlyph from "@/components/symbol-glyph";

type Filter = "All materials" | MaterialType;
const filters: Filter[] = ["All materials", ...materialTypes];

export default function MaterialsLibrary() {
  const [filter, setFilter] = useState<Filter>("All materials");
  const visible = materials.filter((m) => filter === "All materials" || m.type === filter);

  return <>
    <div className="filter-tabs" role="group" aria-label="Filter materials">
      {filters.map((f) => <button key={f} className={f === filter ? "selected" : ""} aria-pressed={f === filter} onClick={() => setFilter(f)}>{f}</button>)}
    </div>
    <div className="materials-grid">
      {visible.map((m) => <article className="supply-card" key={m.name}>
        <div className={`supply-visual ${m.color}`} aria-hidden="true"><SymbolGlyph value={m.icon} /></div>
        <div className="eyebrow">{m.type}</div>
        <h2>{m.name}</h2>
        <p>{m.intro}</p>
        <p className="supply-tip">{m.tip}</p>
      </article>)}
    </div>
    <div className="quiet-note">A reminder from the studio: you don’t need perfect supplies to make something wonderful.</div>
  </>;
}
