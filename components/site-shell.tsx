import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SiteNavigation from "@/components/site-navigation";
export default function SiteShell({ children }: { children: ReactNode }) {
  return <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><SiteNavigation /><div className="workspace"><SiteHeader /><main id="main" className="main">{children}</main><SiteFooter /></div></div>;
}
