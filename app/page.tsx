import Link from "next/link";
import PublicShell from "@/components/public-shell";
import HeroSection from "@/components/hero-section";
import LessonBrowser from "@/components/lesson-browser";
import { RedirectIfSignedIn } from "@/components/auth-gate";
import { courses, courseSlug, featuredMediums } from "@/lib/courses";
import { works } from "@/lib/gallery";

export const metadata = { title: "Your creative space" };

const courseCount = Object.values(courses).flat().length;

const steps = [
  { title: "Pick what you love", body: `Choose from ${courseCount} courses by medium, art style, or theme, from watercolor to origami.` },
  { title: "Follow a guided practice", body: "Every lesson walks you through a small project, one step at a time, at your own pace." },
  { title: "Share and grow together", body: "Post your work, swap tips in discussions, and cheer each other on." },
];

// Landing page for logged-out visitors. Signed-in visitors are sent to their dashboard.
export default function LandingPage() {
  return <PublicShell>
    <RedirectIfSignedIn />
    <HeroSection />

    <section className="landing-section" id="try" aria-labelledby="try-heading">
      <div className="section-heading"><div><h2 id="try-heading">Try a lesson, no account needed</h2><p className="landing-lede">Open one and follow along step by step.</p></div></div>
      <LessonBrowser compact />
    </section>

    <section className="landing-section" aria-labelledby="mediums-heading">
      <div className="section-heading"><div><h2 id="mediums-heading">What will you create?</h2><p className="landing-lede">Join free to unlock every course.</p></div></div>
      <div className="home-category-grid">
        {featuredMediums.map(({ icon, label, course }) => <Link key={label} className="medium" href={`/signup?next=${encodeURIComponent(`/learn/${courseSlug(course)}`)}`}><span className="medium-icon">{icon}</span><span>{label}</span></Link>)}
      </div>
    </section>

    <section className="landing-section" id="how" aria-labelledby="how-heading">
      <div className="section-heading"><h2 id="how-heading">How Pintora works</h2></div>
      <ol className="landing-steps">
        {steps.map((step, index) => <li key={step.title}><span className="landing-step-number">{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}
      </ol>
    </section>

    <section className="landing-section" aria-labelledby="community-heading">
      <div className="section-heading"><div><h2 id="community-heading">Made by our community</h2><p className="landing-lede">Different mediums, endless ways to see.</p></div></div>
      <div className="community-grid">
        {works.slice(0, 4).map((work) => <article className="creation" key={work.title}>
          <img src={`/art/${work.image}.svg`} alt={`${work.title}, a ${work.medium.toLowerCase()} study`} />
          <div className="creation-detail"><div><div className="eyebrow">{work.medium}</div><h3>{work.title}</h3><p>by {work.artist}</p></div></div>
        </article>)}
      </div>
    </section>

    <section className="landing-cta" aria-labelledby="cta-heading">
      <div><h2 id="cta-heading">Ready to make something?</h2><p>Pintora is free. All you need is a little curiosity.</p></div>
      <Link className="primary-btn" href="/signup">Create your free account <span>→</span></Link>
    </section>
  </PublicShell>;
}
