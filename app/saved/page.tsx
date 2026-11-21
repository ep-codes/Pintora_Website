import SiteShell from "@/components/site-shell";
import LessonBrowser from "@/components/lesson-browser";

export const metadata = { title: "Saved lessons" };

export default function SavedPage() {
  return <SiteShell>
    <section className="page-intro">
      <div className="eyebrow">YOUR COLLECTION</div>
      <h1>Lessons you've<br /><em>saved for later.</em></h1>
      <p>Tap the bookmark on any lesson to keep it here. Saved lessons stay on this device.</p>
    </section>
    <LessonBrowser savedOnly />
  </SiteShell>;
}
