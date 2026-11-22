// Pintora logo: the brush "P" and "intora" wordmark. public/logo.png is the original artwork (cropped);
// public/logo-dark.png is the same with the black lettering and brush recolored light for dark mode.
// logo-mark(-dark).png is just the brush "P", used where the full logo doesn't fit.
// CSS shows whichever theme version matches (see .brand-logo in styles.css). The surrounding link
// carries the accessible name, so the images are decorative.
export function Logo({ markOnNarrow = false }: { markOnNarrow?: boolean }) {
  return <>
    {(["light", "dark"] as const).map((theme) => {
      const suffix = theme === "dark" ? "-dark" : "";
      return <picture className={`brand-logo brand-logo-${theme}`} key={theme}>
        {/* Very narrow phones: the logged-out top bar only has room for the mark. */}
        {markOnNarrow && <source media="(max-width: 380px)" srcSet={`/logo-mark${suffix}.png`} width={124} height={168} />}
        <img src={`/logo${suffix}.png`} alt="" width={412} height={168} />
      </picture>;
    })}
  </>;
}
