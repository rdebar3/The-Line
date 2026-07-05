"use client";

import dynamic from "next/dynamic";

import { HeroOverlay } from "@/components/hub/hero-3d/hero-overlay";
import { HubHeroFallback } from "@/components/hub/hub-hero-fallback";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const HeroCanvas = dynamic(
  () => import("@/components/hub/hero-3d/hero-canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="hub-hero-3d-canvas hub-hero-3d-loading">
        <p className="font-mono text-xs tracking-[0.3em] text-gold uppercase">
          Loading command center…
        </p>
      </div>
    ),
  }
);

export function HubHero() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <HubHeroFallback />;
  }

  return (
    <header className="hub-hero-fullscreen">
      <HeroCanvas />
      <HeroOverlay />
    </header>
  );
}