import type { ReactNode } from "react";
import CategoryCard from "@/components/category-card";
import PageIntro from "@/components/page-intro";
import SiteShell from "@/components/site-shell";

export const metadata = { title: "Materials" };
const materials: [ReactNode, ReactNode, string][] = [["◉", "Paints", "bg-lavender"], ["🖌", "Brushes", "bg-peach"], ["➤", "Paper", "bg-blue"], ["✎", <>Drawing<br />Tools</>, "bg-mint"], ["✐", <>Digital<br />Tools</>, "bg-pink"], ["▥", "Surfaces", "bg-lavender"], ["▣", <>Other<br />Supplies</>, "bg-peach"], ["✦", <>All<br />Materials</>, "bg-blue"]];

export default function MaterialsPage() {
  return <SiteShell><section>
    <PageIntro title="Materials Library">Learn about art materials and find the best ones<br />for your creative journey.</PageIntro>
    <h2 className="section-title twenty-title">Browse by Category</h2>
    <div className="card-grid material-grid">{materials.map(([icon, label, color], index) => <CategoryCard key={index} icon={icon} label={label} color={color} variant="material" />)}</div>
  </section></SiteShell>;
}
