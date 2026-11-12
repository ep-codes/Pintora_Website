"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
const links: {href:string; label:string; icon:IconName}[] = [{href:"/",label:"Home",icon:"home"},{href:"/learn",label:"Learn",icon:"learn"},{href:"/community",label:"Explore",icon:"explore"},{href:"/materials",label:"Materials",icon:"materials"},{href:"/community",label:"Community",icon:"community"}];
export default function SiteNavigation() {
 const pathname = usePathname();
 return <aside className="sidebar"><Link className="brand" href="/" aria-label="Pintora home"><span className="brand-mark">✎</span><strong>Pintora</strong></Link><nav className="nav" aria-label="Main navigation">{links.map((link,index)=><Link key={`${link.label}-${index}`} href={link.href} className={pathname===link.href && link.label!=="Explore"?"active":""}><Icon name={link.icon}/>{link.label}</Link>)}<div className="nav-divider"/><Link href="/learn?view=profile"><Icon name="profile"/>Profile</Link><Link href="/learn?view=saved"><Icon name="saved"/>Saved</Link></nav><div className="sidebar-bottom">Made for artists, by artists.</div></aside>;
}
