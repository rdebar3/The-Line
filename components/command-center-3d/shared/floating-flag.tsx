"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type FloatingFlagProps = {
  position?: [number, number, number];
  scale?: number;
};

export function FloatingFlag({
  position = [0, 3, -2],
  scale = 2.5,
}: FloatingFlagProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.08;
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[2.2, 1.3, 8, 4]} />
      <meshStandardMaterial
        color="#1a2438"
        emissive="#3b5998"
        emissiveIntensity={0.15}
        side={THREE.DoubleSide}
        transparent
        opacity={0.35}
        wireframe={false}
      />
    </mesh>
  );
}