import type { CSSProperties } from "react";

// Renders a course / medium / material symbol. Text glyphs ("◉") render as-is; image paths
// ("/icons/pencil.png") are used as a CSS mask so the image takes the surrounding text color,
// matching the glyph icons in both light and dark mode. Image icons need a transparent background.
export default function SymbolGlyph({ value }: { value: string }) {
  if (!value.startsWith("/")) return <>{value}</>;
  return <span className="symbol-image" style={{ "--symbol-image": `url(${value})` } as CSSProperties} />;
}
