import Link from "next/link";

export default function SiteFooter() {
  return <footer className="footer">
    <div>© 2026 Pintora</div>
    <div className="footer-links"><Link href="#">Facebook</Link><Link href="#">Instagram</Link></div>
  </footer>;
}