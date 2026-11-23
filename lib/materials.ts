// Supplies shown on /materials. Every medium in Learn's "Based on Medium" tab (lib/courses.ts)
// has a card here, plus general supplies (paper, brushes).
export type MaterialType = "Paint" | "Drawing" | "Markers" | "Paper" | "Digital" | "Tools";
export const materialTypes: MaterialType[] = ["Paint", "Drawing", "Markers", "Paper", "Digital", "Tools"];

export type Material = { icon: string; name: string; type: MaterialType; intro: string; tip: string; color: "mint" | "sand" | "rose" };

/** Anchor id of a material's card on /materials. */
export const materialSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const materials: Material[] = [
  // Paint
  { icon: "◒", name: "Watercolor", type: "Paint", color: "mint", intro: "A little pigment, a little water, a world of possibility.", tip: "Start with a small student-grade set of primary colors. A mixing palette and two jars of water are all you need." },
  { icon: "◉", name: "Gouache", type: "Paint", color: "rose", intro: "Opaque, velvety color you can rework with water.", tip: "A few primary colors plus white go a long way. Gouache stays re-wettable when dry, so you can soften edges or fix mistakes with a damp brush." },
  { icon: "✦", name: "Acrylic paint", type: "Paint", color: "sand", intro: "Bold, fast-drying color for almost any surface.", tip: "Student-grade red, yellow, blue and white are enough to start. Acrylic dries permanently, so keep your brushes wet while you work and wash them right after." },
  { icon: "◍", name: "Oil paint", type: "Paint", color: "mint", intro: "Rich, slow-drying color with plenty of time to blend.", tip: "Water-mixable oils let you skip harsh solvents. Use a limited palette on primed canvas board, and keep thin layers underneath and thicker paint on top." },
  // Drawing
  { icon: "/icons/pencil.png", name: "Drawing pencils", type: "Drawing", color: "sand", intro: "The simplest tool is often the most expressive.", tip: "An HB pencil is a versatile starting point. Add a 2B for deeper shadows and a kneaded eraser to lift highlights." },
  { icon: "◌", name: "Charcoal", type: "Drawing", color: "rose", intro: "Deep, dramatic darks in just a few strokes.", tip: "Sketch with soft vine charcoal and save compressed charcoal for the darkest shadows. A kneaded eraser lifts highlights; a fixative spray (used outdoors) stops smudging." },
  { icon: "〰", name: "Oil pastels", type: "Drawing", color: "mint", intro: "Buttery, vivid color you can blend with a fingertip.", tip: "A basic 24-color set is plenty. Lay down light colors first, then darker ones, and blend with a finger or paper towel. Heavier paper holds more layers." },
  { icon: "╱", name: "Inking pens", type: "Drawing", color: "sand", intro: "Clean, confident lines for comics and illustration.", tip: "Fineliners in a few tip sizes, like 0.1, 0.3 and 0.5, cover most needs. Pencil your sketch lightly, ink over it, and erase once the ink is fully dry." },
  // Markers
  { icon: "▰", name: "Acrylic markers", type: "Markers", color: "rose", intro: "Paint in a pen, for bold color on almost anything.", tip: "Shake well and press the tip gently until paint flows. They're opaque, so light colors cover dark ones, and they work on paper, wood, stone and more." },
  { icon: "▥", name: "Alcohol markers", type: "Markers", color: "mint", intro: "Smooth blends and bright, streak-free color.", tip: "Start with light and dark versions of a few colors so you can blend. Use smooth marker paper and keep a scrap sheet underneath, because the ink bleeds through." },
  // Paper
  { icon: "▱", name: "Paper & sketchbooks", type: "Paper", color: "sand", intro: "Give your ideas a place to land.", tip: "Choose smooth paper for pencil and heavier, 300 gsm paper for watercolor. A small sketchbook makes daily practice easier." },
  { icon: "◇", name: "Origami paper", type: "Paper", color: "rose", intro: "Just a square of paper and a few good folds.", tip: "Thin 15 cm (6 in) origami paper is easiest to learn with. Make every crease sharp with a fingernail, and start with simple models like a cup or a crane." },
  // Digital
  { icon: "▣", name: "Digital illustration", type: "Digital", color: "mint", intro: "An entire studio, right at your fingertips.", tip: "Use the drawing app you already have; a stylus helps but isn't required. Start with a simple round brush and learn layers before expanding your brush collection." },
  // Tools
  { icon: "⌇", name: "Brushes", type: "Tools", color: "sand", intro: "Find a brush that feels like an extension of you.", tip: "One medium round synthetic brush handles washes, details, and loose marks. Rinse thoroughly and dry flat after use." },
];
