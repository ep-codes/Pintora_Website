export const courses = {
  "Based on Medium": [
    { name: "Watercolor", symbol: "◒", color: "lavender", level: "Easy", projects: ["Beach", "Feathers"] },
    { name: "Acrylic Paint", symbol: "✦", color: "peach" },
    { name: "Gouache", symbol: "◉", color: "mint" },
    { name: "Charcoal", symbol: "◌", color: "blue" },
    { name: "Oil Pastels", symbol: "〰", color: "pink" },
    { name: "Oil Paint", symbol: "◍", color: "lavender" },
    { name: "Traditional / Pencil / Drawing", symbol: "✎", color: "peach", level: "Easy", projects: ["Rose", "Swan", "Fish", "Bear", "Galaxy"] },
    { name: "Inking · Pens", symbol: "╱", color: "blue" },
    { name: "Acrylic Markers", symbol: "▰", color: "mint" },
    { name: "Alcohol Markers", symbol: "▥", color: "pink" },
    { name: "Origami · Paper", symbol: "◇", color: "lavender", level: "Easy", projects: ["Duck", "Fox", "Rose", "Butterfly", "Swan", "Crane"] },
    { name: "Digital Art", symbol: "▣", color: "blue" },
  ],
  "Based on Art Styles": [
    { name: "Anime / Manga", symbol: "✧", color: "pink" },
    { name: "Minimalist Vector Art", symbol: "◈", color: "blue" },
    { name: "Impressionist", symbol: "✳", color: "peach" },
    { name: "Studio Ghibli", symbol: "☁", color: "mint" },
  ],
  "Based on Theme": [
    { name: "Space & Galaxy", symbol: "✦", color: "blue" },
    { name: "Stickers", symbol: "✿", color: "pink" },
    { name: "Wallpapers", symbol: "▧", color: "lavender" },
    { name: "Fruit", symbol: "◉", color: "peach" },
    { name: "Flowers", symbol: "✿", color: "pink" },
    { name: "Animals", symbol: "♧", color: "mint" },
    { name: "Landscapes", symbol: "⌁", color: "blue" },
    { name: "Cities & Sunsets", symbol: "☼", color: "peach" },
  ],
} as const;


export const courseSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Medium tiles shown on the landing page and dashboard. `course` must match a course name above.
export const featuredMediums = [
  { icon: "✎", label: "Drawing", course: "Traditional / Pencil / Drawing" },
  { icon: "✦", label: "Acrylic", course: "Acrylic Paint" },
  { icon: "▣", label: "Digital Art", course: "Digital Art" },
  { icon: "◔", label: "Watercolor", course: "Watercolor" },
  { icon: "◉", label: "Gouache", course: "Gouache" },
] as const satisfies readonly { icon: string; label: string; course: (typeof courses)[keyof typeof courses][number]["name"] }[];
