import type { ReactNode } from "react";

type PageIntroProps = {
  title: string;
  children: ReactNode;
};

export default function PageIntro({ title, children }: PageIntroProps) {
  return <>
    <h1 className="page-title">{title}</h1>
    <p className="subtitle">{children}</p>
  </>;
}