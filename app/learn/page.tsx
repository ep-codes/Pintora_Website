import SiteShell from "@/components/site-shell";
import LessonBrowser from "@/components/lesson-browser";
export const metadata={title:"Learn"};
export default function LearnPage(){return <SiteShell><section className="page-intro"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>A little practice.<br/><em>Endless possibilities.</em></h1><p>Follow your curiosity with approachable lessons, at your own pace.</p></section><LessonBrowser/></SiteShell>}
