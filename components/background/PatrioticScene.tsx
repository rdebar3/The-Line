"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type { Group, Mesh } from "three";

const GOLD = "#c9a227";
const CRIMSON = "#b91c1c";
const CREAM = "#d4c4a0";
const NAVY_LIGHT = "#1e2a45";

type SceneProps = {
  animate: boolean;
  isMobile: boolean;
};

type FloatingElementProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  phase: number;
  animate: boolean;
  kind: "parchment" | "flag";
};

function useMediaPreference(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function FloatingElement({
  position,
  rotation,
  scale,
  color,
  opacity,
  phase,
  animate,
  kind,
}: FloatingElementProps) {
  const meshRef = useRef<Mesh>(null);
  const baseY = position[1];

  useFrame((state) => {
    if (!animate || !meshRef.current) return;

    const time = state.clock.elapsedTime * 0.12 + phase;

    meshRef.current.position.y = baseY + Math.sin(time * 0.6) * 0.18;
    meshRef.current.rotation.z =
      rotation[2] + Math.sin(time * 0.45) * (kind === "parchment" ? 0.06 : 0.1);
    meshRef.current.rotation.y =
      rotation[1] + Math.cos(time * 0.35) * (kind === "flag" ? 0.14 : 0.05);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function SceneContent({ animate, isMobile }: SceneProps) {
  const starsRef = useRef<Group>(null);
  const starCount = isMobile ? 280 : 620;

  const parchmentFragments = useMemo(
    () =>
      (isMobile
        ? [
            {
              position: [-4.2, 1.1, -3] as [number, number, number],
              rotation: [0.2, 0.5, -0.35] as [number, number, number],
              scale: [1.4, 1.9, 1] as [number, number, number],
              phase: 0.2,
            },
            {
              position: [3.8, -0.6, -4] as [number, number, number],
              rotation: [-0.15, -0.4, 0.25] as [number, number, number],
              scale: [1.1, 1.5, 1] as [number, number, number],
              phase: 1.4,
            },
          ]
        : [
            {
              position: [-5.5, 1.4, -2.5] as [number, number, number],
              rotation: [0.15, 0.35, -0.4] as [number, number, number],
              scale: [1.6, 2.2, 1] as [number, number, number],
              phase: 0.1,
            },
            {
              position: [4.8, -0.8, -3.5] as [number, number, number],
              rotation: [-0.2, -0.55, 0.3] as [number, number, number],
              scale: [1.3, 1.8, 1] as [number, number, number],
              phase: 1.2,
            },
            {
              position: [1.2, 2.2, -5] as [number, number, number],
              rotation: [0.35, 0.15, 0.2] as [number, number, number],
              scale: [0.9, 1.2, 1] as [number, number, number],
              phase: 2.4,
            },
            {
              position: [-2.4, -1.8, -4.5] as [number, number, number],
              rotation: [-0.1, 0.25, -0.15] as [number, number, number],
              scale: [1.1, 1.4, 1] as [number, number, number],
              phase: 3.1,
            },
          ]
      ).map((fragment, index) => ({ ...fragment, key: `parchment-${index}` })),
    [isMobile]
  );

  const flagElements = useMemo(
    () =>
      (isMobile
        ? [
            {
              position: [-2.8, -1.4, -6] as [number, number, number],
              rotation: [0, 0.3, 0.08] as [number, number, number],
              scale: [2.8, 1.6, 1] as [number, number, number],
              color: CRIMSON,
              opacity: 0.045,
              phase: 0.8,
            },
          ]
        : [
            {
              position: [-3.6, -1.2, -6] as [number, number, number],
              rotation: [0, 0.25, 0.06] as [number, number, number],
              scale: [3.4, 1.9, 1] as [number, number, number],
              color: CRIMSON,
              opacity: 0.05,
              phase: 0.6,
            },
            {
              position: [3.2, 1.6, -7] as [number, number, number],
              rotation: [0, -0.35, -0.04] as [number, number, number],
              scale: [2.6, 1.4, 1] as [number, number, number],
              color: NAVY_LIGHT,
              opacity: 0.06,
              phase: 2.1,
            },
            {
              position: [0.4, -2.1, -5.5] as [number, number, number],
              rotation: [0, 0.1, 0.12] as [number, number, number],
              scale: [2.2, 1.2, 1] as [number, number, number],
              color: GOLD,
              opacity: 0.04,
              phase: 3.5,
            },
          ]
      ).map((flag, index) => ({ ...flag, key: `flag-${index}` })),
    [isMobile]
  );

  useFrame((_, delta) => {
    if (!animate || !starsRef.current) return;
    starsRef.current.rotation.y += delta * 0.018;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <group ref={starsRef}>
        <Stars
          radius={90}
          depth={45}
          count={starCount}
          factor={isMobile ? 1.2 : 1.6}
          saturation={0.15}
          fade
          speed={animate ? 0.25 : 0}
        />
      </group>
      {parchmentFragments.map((fragment) => (
        <FloatingElement
          key={fragment.key}
          position={fragment.position}
          rotation={fragment.rotation}
          scale={fragment.scale}
          color={CREAM}
          opacity={isMobile ? 0.035 : 0.045}
          phase={fragment.phase}
          animate={animate}
          kind="parchment"
        />
      ))}
      {flagElements.map((flag) => (
        <FloatingElement
          key={flag.key}
          position={flag.position}
          rotation={flag.rotation}
          scale={flag.scale}
          color={flag.color}
          opacity={flag.opacity}
          phase={flag.phase}
          animate={animate}
          kind="flag"
        />
      ))}
    </>
  );
}

function PatrioticCanvas({ animate, isMobile }: SceneProps) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={isMobile ? [1, 1] : [1, 1.35]}
      camera={{ position: [0, 0, 7.5], fov: 52 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      }}
      frameloop={animate ? "always" : "demand"}
      performance={{ min: 0.5 }}
      style={{ background: "transparent" }}
    >
      <SceneContent animate={animate} isMobile={isMobile} />
    </Canvas>
  );
}

export function PatrioticBackground() {
  const prefersReducedMotion = useMediaPreference(
    "(prefers-reduced-motion: reduce)"
  );
  const isMobile = useMediaPreference("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-80">
        <PatrioticCanvas animate={!prefersReducedMotion} isMobile={isMobile} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,15,28,0.2)_0%,rgba(10,15,28,0.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-navy/65" />
    </div>
  );
}