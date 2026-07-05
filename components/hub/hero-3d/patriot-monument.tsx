"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { GUARDIAN_IMAGE } from "@/lib/guardian";

export function PatriotMonument() {
  const group = useRef<THREE.Group>(null);
  const cloak = useRef<THREE.Group>(null);
  const texture = useTexture(GUARDIAN_IMAGE);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.8) * 0.08;
    }
    if (cloak.current) {
      cloak.current.rotation.y = Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group ref={group} position={[0, -0.6, 0]} scale={2.2}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.25, 32]} />
        <meshStandardMaterial
          color="#121a2e"
          emissive="#c9a227"
          emissiveIntensity={0.1}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      <pointLight position={[0, 2.5, 2]} intensity={3} color="#c9a227" distance={10} />
      <pointLight position={[-2, 1.5, -1]} intensity={1.2} color="#b91c1c" distance={8} />

      <group ref={cloak}>
        <mesh position={[0, 1.1, 0]}>
          <planeGeometry args={[1.6, 2.4]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.08}
            emissive="#c9a227"
            emissiveIntensity={0.08}
            metalness={0.1}
            roughness={0.6}
          />
        </mesh>
      </group>

      <mesh position={[0, 2.8, -0.5]}>
        <ringGeometry args={[1.8, 2.1, 48]} />
        <meshStandardMaterial
          color="#c9a227"
          emissive="#c9a227"
          emissiveIntensity={0.25}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}