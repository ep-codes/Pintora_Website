import Link from "next/link";
export default function HeroSection() {
  return <section className="home-layout">
    <div className="hero-copy">
      <span className="hero-kicker">Creative Learning Platform</span>
      <h1>Be <span>Creative.</span><br />Learn new skills.<br />Excel in a new hobby.</h1>
      <p>A free learning platform for artists of all levels. Learn new skills, explore art topics, and share your creations with a creative community.</p>
      <div className="hero-actions">
        <Link className="primary-btn" href="/learn">Start Learning <span>→</span></Link>
        <Link className="secondary-btn" href="/community">Explore Community</Link>
      </div>
    </div>
    <div className="hero-visual" aria-label="Featured art lesson preview">
      <div className="hero-blob" />
      <div className="hero-preview"><img src="/art/still-life.svg" alt="Pastel still life art lesson" /></div>
      <div className="artist-badge"><span className="badge-icon">♧</span><span><strong>Join 1,000+ artists</strong><small>learning and creating together</small></span></div>
    </div>
  </section>;
}
