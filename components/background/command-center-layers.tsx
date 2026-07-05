type CommandCenterLayersProps = {
  /** Page variant adds holographic flag tint over the circuit field. */
  variant?: "global" | "page";
};

/**
 * Lightweight CSS-only ambient layers for the constitutional command center.
 * Respects prefers-reduced-motion via globals.css.
 */
export function CommandCenterLayers({
  variant = "global",
}: CommandCenterLayersProps) {
  return (
    <>
      <div aria-hidden className="command-circuit-grid" />
      <div aria-hidden className="command-data-streams" />
      <div
        aria-hidden
        className={
          variant === "page"
            ? "command-holo-flag"
            : "command-holo-flag command-holo-flag--subtle"
        }
      />
      <div aria-hidden className="command-light-rays" />
      <div aria-hidden className="command-scan-line" />
      <div aria-hidden className="command-particles" />
    </>
  );
}