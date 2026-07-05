"use client";

import {
  Bloom,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";

export function HeroEffects({ isMobile }: { isMobile: boolean }) {
  return (
    <EffectComposer multisampling={isMobile ? 0 : 4}>
      <Bloom
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        intensity={isMobile ? 0.35 : 0.55}
        mipmapBlur
      />
      <Vignette eskil offset={0.08} darkness={isMobile ? 0.6 : 0.75} />
    </EffectComposer>
  );
}