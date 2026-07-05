import { HeroBackground } from "@/components/hub/hero-cinematic/hero-background";
import { HeroPanel } from "@/components/hub/hero-cinematic/hero-panel";
import { HeroPatriot } from "@/components/hub/hero-cinematic/hero-patriot";

export function HubHeroCinematic() {
  return (
    <header className="hub-hero-v3">
      <HeroBackground />
      <div className="hub-hero-v3-layout">
        <HeroPatriot />
        <HeroPanel />
      </div>
    </header>
  );
}