import SiteShell from "@/components/site-shell";
import Dashboard from "@/components/dashboard";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <SiteShell><Dashboard /></SiteShell>;
}
