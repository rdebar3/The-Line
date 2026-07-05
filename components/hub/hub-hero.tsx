"use client";

import { HubHeroCinematic } from "@/components/hub/hub-hero-cinematic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function HubHero() {
  const reducedMotion = usePrefersReducedMotion();

  return <HubHeroCinematic reducedMotion={reducedMotion} />;
}