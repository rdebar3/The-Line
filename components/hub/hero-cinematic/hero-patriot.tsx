import Image from "next/image";

import { GUARDIAN_IMAGE, guardianLabels } from "@/lib/guardian";

export function HeroPatriot() {
  return (
    <div className="hub-hero-v3-patriot-wrap">
      <div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--crimson"
        aria-hidden
      />
      <div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--gold"
        aria-hidden
      />
      <div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--core"
        aria-hidden
      />
      <div className="hub-hero-v3-patriot-rim" aria-hidden />
      <div className="hub-hero-v3-patriot-floor-glow" aria-hidden />
      <div className="hub-hero-v3-patriot-breathe">
        <Image
          src={GUARDIAN_IMAGE}
          alt={guardianLabels.neutral}
          width={560}
          height={820}
          priority
          className="hub-hero-v3-patriot-img"
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 560px"
        />
      </div>
    </div>
  );
}