"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshStandardMaterial
        color="#0a0f1c"
        emissive="#1a2438"
        emissiveIntensity={0.15}
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

function CommandRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.05;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]}>
      <ringGeometry args={[2.8, 4.2, 64]} />
      <meshStandardMaterial
        color="#c9a227"
        emissive="#c9a227"
        emissiveIntensity={0.4}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingPillars() {
  const positions: [number, number, number][] = [
    [-3.5, 0.5, -2],
    [3.5, 0.5, -2],
    [-2.5, 0.8, 1.5],
    [2.5, 0.8, 1.5],
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.12, 2.8, 0.12]} />
          <meshStandardMaterial
            color="#c9a227"
            emissive="#c9a227"
            emissiveIntensity={0.35}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useRef(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 8 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }).current();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#c9a227"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ChamberEnvironment({ showParticles }: { showParticles: boolean }) {
  return (
    <>
      <GridFloor />
      <CommandRing />
      <FloatingPillars />
      {showParticles && <ParticleField />}
    </>
  );
}