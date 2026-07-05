import { CommandCenterLayers } from "@/components/background/command-center-layers";

/**
 * Global command-center backdrop — CSS-only ambient layers (no WebGL).
 * Page shells add the flag hologram via PageBackground.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[1]">
      <div className="absolute inset-0 bg-[#060a14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,39,0.09)_0%,transparent_55%)]" />
      <CommandCenterLayers variant="global" />
      <div className="flag-background-vignette opacity-95" />
    </div>
  );
}