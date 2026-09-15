export default function CommunityToolbar() {
  return <div className="community-toolbar">
    <select className="select" aria-label="Filter by topic"><option>All Topics</option></select>
    <select className="select" aria-label="Sort creations"><option>Popular</option></select>
  </div>;
}