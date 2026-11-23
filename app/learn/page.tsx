import SiteShell from "@/components/site-shell";
import CourseCatalog from "@/components/course-catalog";
import LessonBrowser from "@/components/lesson-browser";

export const metadata = { title: "Courses" };

export default function LearnPage() {
  return <SiteShell>
    <section className="page-intro">
      <div className="eyebrow">MAKE SOMETHING YOURS</div>
      <h1>Find your next<br /><em>creative adventure.</em></h1>
      <p>Explore courses by medium, art style, or the things you love to make.</p>
    </section>
    <CourseCatalog />
    <section className="home-section" id="lessons" aria-labelledby="lessons-heading">
      <div className="section-heading"><h2 className="subheading" id="lessons-heading">Popular tutorials</h2></div>
      <LessonBrowser />
    </section>
  </SiteShell>;
}
