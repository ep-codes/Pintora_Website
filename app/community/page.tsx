import SiteShell from "@/components/site-shell";
import CommunityGallery from "@/components/community-gallery";
export const metadata={title:"Community"};
export default function CommunityPage(){return <SiteShell><section className="page-intro"><div className="eyebrow">EVERY ARTIST STARTS SOMEWHERE</div><h1>A shared love<br/><em>of making things.</em></h1><p>A little inspiration from the studio. Different mediums, endless ways to see.</p></section><CommunityGallery/></SiteShell>}
