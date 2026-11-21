import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme-script";
import "../styles.css";

export const metadata = {
  title: { default: "Pintora", template: "Pintora — %s" },
  description: "A free learning platform for artists to learn skills, explore art topics, and share their work."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The inline script sets data-theme on <html> before the first paint, so the server HTML
  // (which can't know the visitor's theme) differs from the DOM: suppressHydrationWarning accepts that.
  return <html lang="en" data-theme="light" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
    <body>{children}</body>
  </html>;
}
