// Supplies shown on /materials. Every medium in Learn's "Mediums" tab (lib/courses.ts)
// has a card here, plus general supplies (paper, brushes).
export type MaterialType = "Paint" | "Drawing" | "Markers" | "Paper" | "Digital" | "Tools";
export const materialTypes: MaterialType[] = ["Paint", "Drawing", "Markers", "Paper", "Digital", "Tools"];

export type Material = { icon: string; name: string; type: MaterialType; intro: string; color: "mint" | "sand" | "rose" };

/** Anchor id of a material's card on /materials. */
export const materialSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const materials: Material[] = [
  // Paint
  { icon: "◒", name: "Watercolor", type: "Paint", color: "mint", intro: "A little pigment, a little water, a world of possibility." },
  { icon: "◉", name: "Gouache", type: "Paint", color: "rose", intro: "Opaque, velvety color you can rework with water." },
  { icon: "✦", name: "Acrylic paint", type: "Paint", color: "sand", intro: "Bold, fast-drying color for almost any surface." },
  { icon: "◍", name: "Oil paint", type: "Paint", color: "mint", intro: "Rich, slow-drying color with plenty of time to blend." },
  // Drawing
  { icon: "/icons/pencil.png", name: "Drawing pencils", type: "Drawing", color: "sand", intro: "The simplest tool is often the most expressive." },
  { icon: "◌", name: "Charcoal", type: "Drawing", color: "rose", intro: "Deep, dramatic darks in just a few strokes." },
  { icon: "〰", name: "Oil pastels", type: "Drawing", color: "mint", intro: "Buttery, vivid color you can blend with a fingertip." },
  { icon: "╱", name: "Inking pens", type: "Drawing", color: "sand", intro: "Clean, confident lines for comics and illustration." },
  // Markers
  { icon: "▰", name: "Acrylic markers", type: "Markers", color: "rose", intro: "Paint in a pen, for bold color on almost anything." },
  { icon: "▥", name: "Alcohol markers", type: "Markers", color: "mint", intro: "Smooth blends and bright, streak-free color." },
  // Paper
  { icon: "▱", name: "Paper & sketchbooks", type: "Paper", color: "sand", intro: "Give your ideas a place to land." },
  { icon: "◇", name: "Origami paper", type: "Paper", color: "rose", intro: "Just a square of paper and a few good folds." },
  // Digital
  { icon: "▣", name: "Digital illustration", type: "Digital", color: "mint", intro: "An entire studio, right at your fingertips." },
  // Tools
  { icon: "⌇", name: "Brushes", type: "Tools", color: "sand", intro: "Find a brush that feels like an extension of you." },
];
