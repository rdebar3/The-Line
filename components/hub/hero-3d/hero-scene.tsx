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
    target.current.x = mouseX * 0.2;
    target.current.y = mouseY * 0.08;
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      target.current.x,
      1 - Math.exp(-2.5 * delta)
    );
    rig.current.rotation.x = THREE.MathUtils.lerp(
      rig.current.rotation.x,
      -target.current.y,
      1 - Math.exp(-2.5 * delta)
    );
  });

  return (
    <>
      <fog attach="fog" args={["#060a14", 8, 32]} />
      <ambientLight intensity={0.35} color="#8b9dc3" />
      <hemisphereLight
        args={["#3b5998", "#060a14", 0.45]}
        position={[0, 10, 0]}
      />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        color="#e8edf5"
      />
      <directionalLight
        position={[-4, 6, -3]}
        intensity={0.2}
        color="#c9a227"
      />

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