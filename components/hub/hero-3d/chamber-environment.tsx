"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ChamberFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial
          color="#080c16"
          metalness={0.6}
          roughness={0.55}
          emissive="#0a0f1c"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.79, 0]}>
        <ringGeometry args={[2.2, 5.5, 64]} />
        <meshStandardMaterial
          color="#121a2e"
          emissive="#1e2a45"
          emissiveIntensity={0.08}
          metalness={0.5}
          roughness={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

function AmbientGrid() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.78, 0]}
    >
      <planeGeometry args={[30, 30, 1, 1]} />
      <meshBasicMaterial
        color="#c9a227"
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

function DistantPillars() {
  const positions: [number, number, number][] = [
    [-5, 0, -4],
    [5, 0, -4],
    [-4, 0.3, 3],
    [4, 0.3, 3],
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.1, 3.2, 0.1]} />
          <meshStandardMaterial
            color="#1a2438"
            emissive="#c9a227"
            emissiveIntensity={0.08}
            metalness={0.7}
            roughness={0.45}
          />
        </mesh>
      ))}
    </>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useRef(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }).current();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#c9a227"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function ChamberEnvironment({ showParticles }: { showParticles: boolean }) {
  return (
    <>
      <ChamberFloor />
      <AmbientGrid />
      <DistantPillars />
      {showParticles && <ParticleField />}
    </>
  );
}