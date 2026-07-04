"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

import { LivingOathBeacon } from "@/components/living-oath/living-oath-beacon";
import { LivingOathEffects } from "@/components/living-oath/living-oath-effects";
import type { LivingOathEvolution } from "@/lib/living-oath";

type LivingOathSceneProps = {
  evolution: LivingOathEvolution;
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
};

function useSceneQuality() {
  const [quality, setQuality] = useState<"high" | "low">("low");
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setAnimate(!reducedMotion.matches);
      setQuality(
        reducedMotion.matches || mobile.matches ? "low" : "high"
      );
    };

    update();
    reducedMotion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return { quality, animate };
}

function SceneInner({
  evolution,
  interactive,
  autoRotate,
  quality,
  animate,
}: {
  evolution: LivingOathEvolution;
  interactive?: boolean;
  autoRotate?: boolean;
  quality: "high" | "low";
  animate: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#060a14"]} />
      <fog attach="fog" args={["#060a14", 4, 14]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.9}
        color="#e8edf5"
      />
      <directionalLight
        position={[-4, 2, -2]}
        intensity={0.35}
        color="#c9a227"
      />
      <Stars
        radius={40}
        depth={30}
        count={quality === "high" ? 1200 : 400}
        factor={2}
        saturation={0.1}
        fade
        speed={animate ? 0.3 : 0}
      />
      <LivingOathBeacon
        evolution={evolution}
        autoRotate={autoRotate && animate}
        animate={animate}
      />
      {interactive && animate && (
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.65}
          autoRotate={autoRotate}
          autoRotateSpeed={0.35}
        />
      )}
      {animate && (
        <LivingOathEffects evolution={evolution} quality={quality} />
      )}
    </>
  );
}

export function LivingOathScene({
  evolution,
  interactive = false,
  autoRotate = false,
  className,
}: LivingOathSceneProps) {
  const { quality, animate } = useSceneQuality();
  const isMobile = quality === "low";

  return (
    <div className={className}>
      <Canvas
        className="h-full w-full"
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 1.1, 3.8], fov: 42 }}
        gl={{
          alpha: false,
          antialias: quality === "high",
          powerPreference: isMobile ? "low-power" : "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        frameloop={animate ? "always" : "demand"}
      >
        <Suspense fallback={null}>
          <SceneInner
            evolution={evolution}
            interactive={interactive}
            autoRotate={autoRotate}
            quality={quality}
            animate={animate}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}