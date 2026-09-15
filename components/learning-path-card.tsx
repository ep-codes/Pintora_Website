import type { ReactNode } from "react";

type LearningPathCardProps = {
  name: ReactNode;
  color: string;
};

export default function LearningPathCard({ name, color }: LearningPathCardProps) {
  return <div className={`path-card ${color}`}>
    {name}
    <small>24 lessons</small>
  </div>;
}