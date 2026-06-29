import type { ReactNode } from "react";

const FLAG_BACKGROUND_IMAGE = "/flag-background.png";

export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-navy">
      <div
        aria-hidden
        className="flag-background-image"
        style={{ backgroundImage: `url("${FLAG_BACKGROUND_IMAGE}")` }}
      />
      <div aria-hidden className="flag-background-vignette" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}