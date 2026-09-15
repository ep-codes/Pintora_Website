import type { ReactNode } from "react";

type CategoryCardProps = {
  icon: ReactNode;
  label: ReactNode;
  color: string;
  variant?: "home" | "learning" | "material";
};

export default function CategoryCard({ icon, label, color, variant = "learning" }: CategoryCardProps) {
  if (variant === "home") {
    return <button type="button" className={`home-category ${color}`}><span className="big-icon">{icon}</span><span>{label}</span></button>;
  }

  if (variant === "material") {
    return <div className={`material-card ${color}`}><span className="big-icon">{icon}</span><span>{label}</span></div>;
  }

  return <div className={`category-card ${color}`}>
    <div className="big-icon">{icon}</div>
    <div>
      <div className="label">{label}</div>
      <div className="meta">24 lessons</div>
      <div className="level">Beginner → Advanced</div>
    </div>
  </div>;
}