"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { ImmersiveScene } from "@/components/command-center-3d/immersive-scene";
import { useMobileGpu } from "@/hooks/use-mobile-gpu";
import { PALETTE } from "@/lib/command-center-3d/constants";

export default function ImmersiveCanvas() {
  const isMobile = useMobileGpu();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-0"
      style={{ top: "var(--site-header-height)" }}
      aria-hidden={false}
    >
      <Canvas
        className="h-full w-full touch-none"
        dpr={isMobile ? [1, 1.25] : [1, 2]}
        camera={{ position: [0, 2.5, 9], fov: 50, near: 0.1, far: 100 }}
        gl={{
          antialias: !isMobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
      >
        <color attach="background" args={[PALETTE.void]} />
        <ImmersiveScene />
      </Canvas>
    </div>
  );
}