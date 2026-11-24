import SiteShell from "@/components/site-shell";
import LessonBrowser from "@/components/lesson-browser";

export const metadata = { title: "Bookmarks" };

export default function SavedPage() {
  return <SiteShell>
    <section className="page-intro">
      <div className="eyebrow">YOUR COLLECTION</div>
      <h1>Lessons you've<br /><em>bookmarked.</em></h1>
      <p>Tap the bookmark on any lesson to keep it here. You’ll find them here wherever you log in.</p>
    </section>
    <LessonBrowser savedOnly />
  </SiteShell>;
}
