import CategoryCard from "@/components/category-card";
import ContinueLearningCard from "@/components/continue-learning-card";
import HeroSection from "@/components/hero-section";
import SiteShell from "@/components/site-shell";
import TrendingTutorials from "@/components/trending-tutorials";

export const metadata = { title: "Home" };
const categories = [["✎", "Drawing", "bg-lavender"], ["✦", "Acrylic", "bg-peach"], ["▣", "Digital Art", "bg-blue"], ["◔", "Watercolor", "bg-mint"], ["◉", "Gouache", "bg-pink"]];

export default function HomePage() {
  return (
    <SiteShell>
      <HeroSection />
      <section className="home-section">
        <h2 className="section-title purple">What will you create today?</h2>
        <h3 className="section-title compact-title">Browse by Category</h3>
        <div className="home-category-grid">{categories.map(([icon, label, color]) => <CategoryCard key={label} icon={icon} label={label} color={color} variant="home" />)}</div>
      </section>
      <section className="home-section">
        <h3 className="section-title small-title">Continue Learning</h3>
        <ContinueLearningCard />
      </section>
      <section className="home-section"><h3 className="section-title small-title">Trending Tutorials</h3><TrendingTutorials /></section>
    </SiteShell>
  );
}
