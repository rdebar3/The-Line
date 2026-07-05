"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";

import { HeroScene } from "@/components/hub/hero-3d/hero-scene";
import { useMobileGpu } from "@/hooks/use-mobile-gpu";

export default function HeroCanvas() {
  const isMobile = useMobileGpu();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  return (
    <Canvas
      className="hub-hero-3d-canvas"
      dpr={isMobile ? [1, 1.25] : [1, 2]}
      camera={{ position: [0.4, 0.6, 6.8], fov: 42, near: 0.1, far: 50 }}
      gl={{
        antialias: !isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        powerPreference: isMobile ? "low-power" : "high-performance",
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 1.2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -0.6;
        setMouse({ x, y });
      }}
    >
      <color attach="background" args={["#060a14"]} />
      <HeroScene
        isMobile={isMobile}
        mouseX={mouse.x}
        mouseY={mouse.y}
      />
    </Canvas>
  );
}