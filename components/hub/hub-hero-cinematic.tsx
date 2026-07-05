"use client";

import { HeroBackground } from "@/components/hub/hero-cinematic/hero-background";
import { HeroPanel } from "@/components/hub/hero-cinematic/hero-panel";
import { HeroPatriot } from "@/components/hub/hero-cinematic/hero-patriot";

type HubHeroCinematicProps = {
  reducedMotion?: boolean;
};

export function HubHeroCinematic({ reducedMotion = false }: HubHeroCinematicProps) {
  return (
    <header className="hub-hero-cinematic">
      <HeroBackground reducedMotion={reducedMotion} />
      <div className="hub-hero-cinematic-layout">
        <HeroPatriot reducedMotion={reducedMotion} />
        <HeroPanel reducedMotion={reducedMotion} />
      </div>
    </header>
  );
}