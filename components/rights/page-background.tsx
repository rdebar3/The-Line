import type { ReactNode } from "react";

import { CommandCenterLayers } from "@/components/background/command-center-layers";

const FLAG_BACKGROUND_IMAGE = "/flag-background.png";

export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-[#060a14]">
      <div
        aria-hidden
        className="flag-background-image opacity-[0.22] mix-blend-screen"
        style={{ backgroundImage: `url("${FLAG_BACKGROUND_IMAGE}")` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <CommandCenterLayers variant="page" />
      </div>
      <div aria-hidden className="flag-background-vignette" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}