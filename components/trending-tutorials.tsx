export default function TrendingTutorials() {
  return <div className="trending-grid">{[0, 1, 2].map((item) => <div className="trending-card" key={item} />)}</div>;
}