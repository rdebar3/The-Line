"use client";

import { HeroPanel } from "@/components/hub/hero-cinematic/hero-panel";
import { HeroScrollVideo } from "@/components/hub/hero-cinematic/hero-scroll-video";

export function HubHeroCinematic() {
  return (
    <HeroScrollVideo>
      <HeroPanel />
    </HeroScrollVideo>
  );
}