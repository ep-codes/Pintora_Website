import SiteShell from "@/components/site-shell";
import ProfileSettings from "@/components/profile-settings";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return <SiteShell><ProfileSettings /></SiteShell>;
}
