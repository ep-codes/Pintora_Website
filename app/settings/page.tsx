import SettingsView from "@/components/settings-view";
import SiteShell from "@/components/site-shell";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SiteShell><SettingsView /></SiteShell>;
}
