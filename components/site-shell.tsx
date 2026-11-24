import type { ReactNode } from "react";
import { RequireSession } from "@/components/auth-gate";
import Notice from "@/components/notice";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SiteNavigation from "@/components/site-navigation";

// Layout for signed-in pages. Guests are sent to /login (see RequireSession).
export default function SiteShell({ children }: { children: ReactNode }) {
  return <RequireSession>
    <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><SiteNavigation /><div className="workspace"><SiteHeader /><main id="main" className="main">{children}</main><SiteFooter /></div><Notice /></div>
  </RequireSession>;
}
