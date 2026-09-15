import Link from "next/link";
import type { ReactNode } from "react";
import CategoryCard from "@/components/category-card";
import LearningPathCard from "@/components/learning-path-card";
import PageIntro from "@/components/page-intro";
import SiteShell from "@/components/site-shell";

export const metadata = { title: "Learn" };
const categories = [["✎", "Drawing", "bg-lavender"], ["✦", "Acrylic", "bg-peach"], ["▣", "Digital Art", "bg-blue"], ["◔", "Watercolor", "bg-mint"], ["◉", "Gouache", "bg-pink"], ["♢", "Origami", "bg-lavender"]];
const paths: [ReactNode, string][] = [["Watercolor Basics", "bg-peach"], ["Portrait Drawing", "bg-blue"], [<>Color Theory<br />Fundamentals</>, "bg-mint"]];

export default function LearnPage() {
  return <SiteShell><section>
    <PageIntro title="Learn">Choose a path and start learning.</PageIntro>
    <div className="card-grid learning-grid">{categories.map(([icon, label, color]) => <CategoryCard key={label} icon={icon} label={label} color={color} />)}</div>
    <div className="path-header"><h2 className="section-title path-title">Recommended Learning Paths</h2><Link className="view-all" href="#">View All</Link></div>
    <div className="card-grid learning-grid paths-grid">{paths.map(([name, color], index) => <LearningPathCard key={index} name={name} color={color} />)}</div>
  </section></SiteShell>;
}
