// Community artwork shown in the gallery and as a preview on the landing page. All sample content.
export type SampleComment = { name: string; username: string; text: string; when: string };
export type Work = {
  id: string; title: string; artist: string; username: string; image: string; medium: string; likes: number; caption: string;
  /** Names that match lib/materials link to that card on /materials. */
  materials: string[];
  comments: SampleComment[];
};

export const works: Work[] = [
  { id: "slow-sunday-mornings", title: "Slow Sunday mornings", artist: "Emma R.", username: "emma.rivers", image: "still-life", medium: "Gouache", likes: 42,
    caption: "A vase, a pear and a very quiet kitchen. I let every layer dry before touching the shadows, which took some patience.",
    materials: ["Gouache", "Brushes", "Paper & sketchbooks", "Mixing palette"],
    comments: [{ name: "Nina K.", username: "ninakeeps", text: "The shadow under the pear is so soft. Lovely!", when: "2 days ago" }, { name: "Leo W.", username: "leo.draws", text: "This makes me want to paint my breakfast table.", when: "4 days ago" }] },
  { id: "somewhere-quiet", title: "Somewhere quiet", artist: "Oliver C.", username: "oliverchen", image: "landscape", medium: "Watercolor", likes: 68,
    caption: "Three layers of hills and one small path. The furthest hill is mostly water with a whisper of violet.",
    materials: ["Watercolor", "Brushes", "Paper & sketchbooks", "Two jars of water"],
    comments: [{ name: "Maya T.", username: "mayapaints", text: "How did you keep the hill edges so crisp?", when: "Yesterday" }, { name: "Oliver C.", username: "oliverchen", text: "I waited until each layer was completely dry. Tea breaks help!", when: "Yesterday" }] },
  { id: "finding-my-palette", title: "Finding my palette", artist: "Sofia L.", username: "sofialane", image: "colors", medium: "Acrylic", likes: 35,
    caption: "I limited myself to a handful of mixes and played with shapes until they felt like friends.",
    materials: ["Acrylic paint", "Brushes", "Mixing palette", "Canvas board"],
    comments: [{ name: "June P.", username: "junepetals", text: "That peach next to the violet is perfect.", when: "3 days ago" }] },
  { id: "objects-on-my-desk", title: "Objects on my desk", artist: "Alex M.", username: "alexmakes", image: "drawing", medium: "Drawing", likes: 27,
    caption: "Ten minutes, one mug and one carton. Practicing seeing the big shapes before the details.",
    materials: ["Drawing pencils", "Paper & sketchbooks", "Kneaded eraser"],
    comments: [{ name: "Emma R.", username: "emma.rivers", text: "The hatching gives the mug so much weight.", when: "5 days ago" }] },
  { id: "last-light-on-the-hills", title: "Last light on the hills", artist: "Maya T.", username: "mayapaints", image: "sunset-study", medium: "Watercolor", likes: 51,
    caption: "Chasing the few minutes when everything turns pink. Painted quickly, before I could overthink it.",
    materials: ["Watercolor", "Brushes", "Paper & sketchbooks"],
    comments: [{ name: "Sofia L.", username: "sofialane", text: "I can feel the evening air in this one.", when: "Yesterday" }, { name: "Alex M.", username: "alexmakes", text: "Such a gentle sky.", when: "2 days ago" }] },
  { id: "flowers-kept-forever", title: "Flowers kept forever", artist: "Nina K.", username: "ninakeeps", image: "pressed-flowers", medium: "Gouache", likes: 39,
    caption: "Inspired by the flowers my grandmother used to press between the pages of her cookbooks.",
    materials: ["Gouache", "Brushes", "Inking pens", "Paper & sketchbooks"],
    comments: [{ name: "June P.", username: "junepetals", text: "What a beautiful memory to paint from.", when: "6 days ago" }] },
  { id: "little-city-corners", title: "Little city corners", artist: "Leo W.", username: "leo.draws", image: "city-sketch", medium: "Drawing", likes: 33,
    caption: "Sketched from a bench on my lunch break. Wonky windows stay wonky.",
    materials: ["Inking pens", "Alcohol markers", "Paper & sketchbooks"],
    comments: [{ name: "Oliver C.", username: "oliverchen", text: "The wonky windows are the best part.", when: "3 days ago" }] },
  { id: "a-garden-in-my-head", title: "A garden in my head", artist: "June P.", username: "junepetals", image: "abstract-garden", medium: "Acrylic", likes: 46,
    caption: "No reference, no plan. Just four blocks of color that slowly turned into a garden.",
    materials: ["Acrylic paint", "Acrylic markers", "Brushes", "Canvas board"],
    comments: [{ name: "Nina K.", username: "ninakeeps", text: "I'd love to walk through this.", when: "Yesterday" }, { name: "Emma R.", username: "emma.rivers", text: "Those muted greens!", when: "4 days ago" }] },
];
