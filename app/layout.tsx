import type { ReactNode } from "react";
import "../styles.css";

export const metadata = {
  title: { default: "Pintora", template: "Pintora — %s" },
  description: "A free learning platform for artists to learn skills, explore art topics, and share their work."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
