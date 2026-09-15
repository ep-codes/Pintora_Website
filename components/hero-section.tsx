import Link from "next/link";

export default function HeroSection() {
  return <section className="home-layout">
    <div className="hero-copy">
      <h1 className="hero-title">Be <span className="accent">Creative.</span><br /><span className="accent">Learn</span> new skills.<br /><span className="accent">Excel</span> in a new hobby.</h1>
      <p>A free learning platform for artists of all levels. Learn new skills, explore art topics, and share your creations with a creative community.</p>
      <div className="hero-actions"><Link className="primary-btn" href="/learn">Start Learning</Link><Link className="secondary-btn" href="/community">Explore Community</Link></div>
    </div>
    <div className="hero-art"><div className="hero-placeholder">▧</div><div className="hero-tag"><strong>Join 1000+ artists</strong><br /><small>learning and creating together</small></div></div>
  </section>;
}