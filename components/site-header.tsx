import Link from "next/link";

export default function SiteHeader() {
  return <header className="topbar">
    <div className="search-wrap"><input className="search" type="search" placeholder="Search" aria-label="Search Pintora" /></div>
    <div className="auth"><Link href="#">Log In</Link><button className="signup" type="button">Sign Up</button></div>
  </header>;
}