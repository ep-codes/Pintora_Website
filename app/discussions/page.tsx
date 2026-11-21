import SiteShell from "@/components/site-shell";
import DiscussionBoard from "@/components/discussion-board";

export const metadata = { title: "Discussions" };
export default function DiscussionsPage() {
  return <SiteShell><section className="page-intro"><div className="eyebrow">THE CONVERSATION CORNER</div><h1>Let's talk <em>art.</em></h1><p>Ask questions, share what you're working on, and learn together.</p></section><DiscussionBoard /></SiteShell>;
}
