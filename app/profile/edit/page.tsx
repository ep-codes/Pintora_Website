import EditProfile from "@/components/edit-profile";
import SiteShell from "@/components/site-shell";

export const metadata = { title: "Edit profile" };

export default function EditProfilePage() {
  return <SiteShell><EditProfile /></SiteShell>;
}
