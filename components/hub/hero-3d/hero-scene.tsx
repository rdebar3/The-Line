"use client";

import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { ChamberEnvironment } from "@/components/hub/hero-3d/chamber-environment";
import { HeroEffects } from "@/components/hub/hero-3d/hero-effects";
import { MONUMENT_ANCHOR, PatriotMonument } from "@/components/hub/hero-3d/patriot-monument";

const LOOK_AT = new THREE.Vector3(MONUMENT_ANCHOR[0], 0.55, 0.2);

type HeroSceneProps = {
  isMobile: boolean;
  mouseX: number;
  mouseY: number;
};

function CameraRig({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    target.current.x = mouseX * 0.12;
    target.current.y = mouseY * 0.04;

    const baseX = 0.6 + target.current.x;
    const baseY = 0.5 + target.current.y;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, baseX, 1 - Math.exp(-2 * delta));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseY, 1 - Math.exp(-2 * delta));
    camera.lookAt(LOOK_AT);
  });

  return null;
}

export function HeroScene({ isMobile, mouseX, mouseY }: HeroSceneProps) {
  const rig = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rig.current) return;
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      mouseX * 0.05,
      1 - Math.exp(-2 * delta)
    );
  });

  return (
    <>
      <fog attach="fog" args={["#060a14", 12, 38]} />
      <ambientLight intensity={0.42} color="#9aa8c4" />
      <hemisphereLight args={["#4a6ab0", "#060a14", 0.55]} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#e8edf5" />
      <directionalLight position={[-4, 5, 2]} intensity={0.3} color="#c9a227" />

      <CameraRig mouseX={mouseX} mouseY={mouseY} />

      <group ref={rig}>
        <Suspense fallback={null}>
          <ChamberEnvironment showParticles={!isMobile} monumentX={MONUMENT_ANCHOR[0]} />
          <PatriotMonument />
        </Suspense>
      </group>

      <HeroEffects isMobile={isMobile} />
    </>
  );
}