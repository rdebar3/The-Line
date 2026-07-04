"use client";

import {
  Bloom,
  EffectComposer,
  SSAO,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

import type { LivingOathEvolution } from "@/lib/living-oath";

type LivingOathEffectsProps = {
  evolution: LivingOathEvolution;
  quality: "high" | "low";
};

export function LivingOathEffects({
  evolution,
  quality,
}: LivingOathEffectsProps) {
  const isHigh = quality === "high";
  const bloomIntensity = evolution.bloomStrength * (isHigh ? 1 : 0.55);

  return (
    <EffectComposer multisampling={isHigh ? 4 : 0}>
      <SSAO
        intensity={isHigh ? 18 : 0}
        radius={0.12}
        luminanceInfluence={0.45}
        bias={0.025}
      />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.82}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />
      <Vignette
        offset={0.22}
        darkness={0.62}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}