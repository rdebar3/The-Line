"use client";

import {
  Bloom,
  EffectComposer,
  SSAO,
  Vignette,
} from "@react-three/postprocessing";

import { useMobileGpu } from "@/hooks/use-mobile-gpu";

export function PostProcessingEffects() {
  const isMobile = useMobileGpu();

  if (isMobile) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.85}
          intensity={0.45}
          mipmapBlur
        />
        <Vignette eskil offset={0.12} darkness={0.65} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <SSAO
        intensity={12}
        radius={0.12}
        luminanceInfluence={0.4}
        worldDistanceThreshold={20}
        worldDistanceFalloff={5}
      />
      <Bloom
        luminanceThreshold={0.35}
        luminanceSmoothing={0.85}
        intensity={0.75}
        mipmapBlur
      />
      <Vignette eskil offset={0.12} darkness={0.85} />
    </EffectComposer>
  );
}