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
        luminanceThreshold={0.35}
        luminanceSmoothing={0.85}
        intensity={isMobile ? 0.5 : 0.75}
        mipmapBlur
      />
      <Vignette eskil offset={0.1} darkness={isMobile ? 0.65 : 0.8} />
    </EffectComposer>
  );
}