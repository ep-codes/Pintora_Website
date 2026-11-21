// Pintora's mark: a brush-stroke "P" with a paint dot, on the brand gradient (see .brand-mark).
// app/icon.svg is the same drawing for the browser tab.
export function LogoMark() {
  return <span className="brand-mark" aria-hidden="true">
    <svg viewBox="1 0 24 24">
      <path d="M8.6 18.6V5.6h4.1a3.9 3.9 0 0 1 0 7.8H8.6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.9" cy="17.4" r="1.75" fill="#ffd8c9" />
    </svg>
  </span>;
}
