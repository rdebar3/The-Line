"use client";

import dynamic from "next/dynamic";

import { Hub2DFallback } from "@/components/command-center-3d/hub-2d-fallback";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const ImmersiveCanvas = dynamic(
  () => import("@/components/command-center-3d/immersive-canvas"),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-center bg-[#060a14]"
        style={{ top: "var(--site-header-height)" }}
      >
        <p className="animate-pulse font-mono text-xs tracking-[0.3em] text-gold uppercase">
          Initializing command center…
        </p>
      </div>
    ),
  }
);

export function CommandCenterExperience() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <Hub2DFallback />;
  }

  return <ImmersiveCanvas />;
}