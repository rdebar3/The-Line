"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { ChamberEnvironment } from "@/components/hub/hero-3d/chamber-environment";
import { HeroEffects } from "@/components/hub/hero-3d/hero-effects";
import { PatriotMonument } from "@/components/hub/hero-3d/patriot-monument";

type HeroSceneProps = {
  isMobile: boolean;
  mouseX: number;
  mouseY: number;
};

export function HeroScene({ isMobile, mouseX, mouseY }: HeroSceneProps) {
  const rig = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!rig.current) return;
    target.current.x = mouseX * 0.35;
    target.current.y = mouseY * 0.15;
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      target.current.x,
      1 - Math.exp(-3 * delta)
    );
    rig.current.rotation.x = THREE.MathUtils.lerp(
      rig.current.rotation.x,
      -target.current.y,
      1 - Math.exp(-3 * delta)
    );
  });

  return (
    <>
      <fog attach="fog" args={["#060a14", 6, 28]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 8, 4]} intensity={0.6} color="#c9a227" />
      <directionalLight position={[-3, 4, -2]} intensity={0.25} color="#3b5998" />

      <group ref={rig}>
        <Suspense fallback={null}>
          <ChamberEnvironment showParticles={!isMobile} />
          <PatriotMonument />
        </Suspense>
      </group>

      <HeroEffects isMobile={isMobile} />
    </>
  );
}