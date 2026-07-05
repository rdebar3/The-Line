"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ChamberWalls({ monumentX }: { monumentX: number }) {
  const wallMat = (
    <meshStandardMaterial
      color="#0a0f1c"
      metalness={0.5}
      roughness={0.7}
      emissive="#1a2438"
      emissiveIntensity={0.12}
      side={THREE.DoubleSide}
    />
  );

  return (
    <>
      <mesh position={[monumentX - 5, 1.5, -2.5]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[9, 6]} />
        {wallMat}
      </mesh>
      <mesh position={[monumentX + 7, 1.5, -2]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[10, 6]} />
        {wallMat}
      </mesh>
      <mesh position={[monumentX + 1, 3.5, -5.5]} rotation={[0.12, 0, 0]}>
        <planeGeometry args={[18, 4]} />
        {wallMat}
      </mesh>
    </>
  );
}

function ChamberFloor({ monumentX }: { monumentX: number }) {
  return (
    <group position={[monumentX + 0.5, -0.55, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color="#080c16"
          metalness={0.65}
          roughness={0.5}
          emissive="#0f1525"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.8, 4.5, 64]} />
        <meshStandardMaterial
          color="#1a2438"
          emissive="#c9a227"
          emissiveIntensity={0.12}
          metalness={0.7}
          roughness={0.45}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.8, 5.2, 64]} />
        <meshStandardMaterial
          color="#c9a227"
          emissive="#c9a227"
          emissiveIntensity={0.08}
          metalness={0.8}
          roughness={0.4}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function ForegroundPillars({ monumentX }: { monumentX: number }) {
  const positions: [number, number, number][] = [
    [monumentX - 4.2, 0.2, 2],
    [monumentX + 1.8, 0.2, 2.2],
    [monumentX - 0.8, 0.2, 2.8],
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.14, 2.6, 0.14]} />
          <meshStandardMaterial
            color="#121a2e"
            emissive="#c9a227"
            emissiveIntensity={0.22}
            metalness={0.75}
            roughness={0.35}
          />
        </mesh>
      ))}
    </>
  );
}

function ParticleField({ monumentX }: { monumentX: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useRef(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = monumentX + (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }).current();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.035}
        color="#c9a227"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function ChamberEnvironment({
  showParticles,
  monumentX = 0,
}: {
  showParticles: boolean;
  monumentX?: number;
}) {
  return (
    <>
      <ChamberWalls monumentX={monumentX} />
      <ChamberFloor monumentX={monumentX} />
      <ForegroundPillars monumentX={monumentX} />
      {showParticles && <ParticleField monumentX={monumentX} />}
    </>
  );
}