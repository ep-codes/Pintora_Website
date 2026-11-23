import SiteShell from "@/components/site-shell";
import ProfileView from "@/components/profile-view";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return <SiteShell><ProfileView /></SiteShell>;
}
