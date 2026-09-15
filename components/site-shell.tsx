"use client";

import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SiteNavigation from "@/components/site-navigation";

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SiteNavigation />
      <main className="main">
        <SiteHeader />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
