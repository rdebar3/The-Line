/**
 * Static patriotic backdrop — no WebGL / Three.js.
 * Page-level shells (PageBackground) add the flag image where needed.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[1]">
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.07)_0%,transparent_55%)]" />
      <div className="flag-background-vignette opacity-90" />
    </div>
  );
}