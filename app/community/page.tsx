import CommunityPostCard from "@/components/community-post-card";
import CommunityToolbar from "@/components/community-toolbar";
import PageIntro from "@/components/page-intro";
import SiteShell from "@/components/site-shell";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return <SiteShell><section>
    <PageIntro title="Community Creations">See what artists are creating and get inspired.</PageIntro>
    <CommunityToolbar />
    <div className="card-grid gallery-grid">{Array.from({ length: 12 }, (_, index) => <CommunityPostCard key={index} />)}</div>
  </section></SiteShell>;
}
