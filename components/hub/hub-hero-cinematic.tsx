"use client";

import { useRef } from "react";

import { HeroBackground } from "@/components/hub/hero-cinematic/hero-background";
import { HeroPanel } from "@/components/hub/hero-cinematic/hero-panel";
import { HeroPatriot } from "@/components/hub/hero-cinematic/hero-patriot";

type HubHeroCinematicProps = {
  reducedMotion?: boolean;
};

export function HubHeroCinematic({ reducedMotion = false }: HubHeroCinematicProps) {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <header ref={heroRef} className="hub-hero-v3">
      <HeroBackground reducedMotion={reducedMotion} containerRef={heroRef} />
      <div className="hub-hero-v3-layout">
        <HeroPatriot reducedMotion={reducedMotion} containerRef={heroRef} />
        <HeroPanel reducedMotion={reducedMotion} />
      </div>
    </header>
  );
}