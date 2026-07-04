"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import * as THREE from "three";

import type { LivingOathEvolution } from "@/lib/living-oath";

const GOLD = new THREE.Color("#c9a227");
const CRIMSON = new THREE.Color("#b91c1c");
const NAVY = new THREE.Color("#121a2e");
const BLUE = new THREE.Color("#3b5998");
const CREAM = new THREE.Color("#d4c4a0");

type LivingOathBeaconProps = {
  evolution: LivingOathEvolution;
  autoRotate?: boolean;
  animate?: boolean;
};

function Scroll({
  angle,
  radius,
  y,
  evolution,
  animate,
}: {
  angle: number;
  radius: number;
  y: number;
  evolution: LivingOathEvolution;
  animate: boolean;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current || !animate) return;
    const t = state.clock.elapsedTime * 0.35 + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = y + Math.sin(t * 1.4) * 0.08;
    ref.current.rotation.y = -t;
  });

  return (
    <mesh ref={ref} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
      <boxGeometry args={[0.12, 0.28, 0.06]} />
      <meshStandardMaterial
        color={CREAM}
        emissive={GOLD}
        emissiveIntensity={evolution.glowIntensity * 0.15}
        roughness={0.85}
      />
    </mesh>
  );
}

export function LivingOathBeacon({
  evolution,
  autoRotate = false,
  animate = true,
}: LivingOathBeaconProps) {
  const groupRef = useRef<Group>(null);
  const cloakRef = useRef<Mesh>(null);
  const auraRef = useRef<Mesh>(null);

  const scrollAngles = useMemo(
    () =>
      Array.from({ length: evolution.scrollCount }, (_, index) => (index / evolution.scrollCount) * Math.PI * 2),
    [evolution.scrollCount]
  );

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.22;
    }

    if (!animate) return;

    const time = state.clock.elapsedTime;

    if (cloakRef.current) {
      cloakRef.current.rotation.x =
        0.12 + Math.sin(time * evolution.cloakFlow) * 0.08;
      cloakRef.current.rotation.z =
        Math.sin(time * 0.45) * 0.06 * evolution.cloakFlow;
    }

    if (auraRef.current) {
      const pulse = 1 + Math.sin(time * 1.2) * 0.06;
      auraRef.current.scale.setScalar(evolution.auraRadius * pulse);
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(time * 0.9) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      {/* Ground aura — blooms strongly */}
      <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <ringGeometry args={[0.55, evolution.auraRadius, 48]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Legs / base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.5, 8]} />
        <meshStandardMaterial
          color={NAVY}
          emissive={GOLD}
          emissiveIntensity={evolution.armorEmissive * 0.5}
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>

      {/* Torso armor */}
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.28, 0.42, 6, 12]} />
        <meshStandardMaterial
          color={NAVY}
          emissive={GOLD}
          emissiveIntensity={evolution.armorEmissive}
          metalness={0.65}
          roughness={0.32}
        />
      </mesh>

      {/* Chest seal — primary bloom target */}
      <mesh position={[0, 0.78, 0.27]}>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 24]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={evolution.glowIntensity * 0.85}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {evolution.hasShoulderArmor && (
        <>
          <mesh position={[-0.34, 0.88, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.18, 0.1, 0.22]} />
            <meshStandardMaterial
              color={NAVY}
              emissive={GOLD}
              emissiveIntensity={evolution.armorEmissive * 0.7}
              metalness={0.7}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0.34, 0.88, 0]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.18, 0.1, 0.22]} />
            <meshStandardMaterial
              color={NAVY}
              emissive={GOLD}
              emissiveIntensity={evolution.armorEmissive * 0.7}
              metalness={0.7}
              roughness={0.28}
            />
          </mesh>
        </>
      )}

      {/* Head — No Face (smooth, featureless) */}
      <mesh position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#1a2438"
          emissive={GOLD}
          emissiveIntensity={evolution.glowIntensity * 0.12}
          metalness={0.35}
          roughness={0.55}
        />
      </mesh>

      {/* Tricorn hat */}
      <group position={[0, 1.32, 0]}>
        <mesh rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.07, 3]} />
          <meshStandardMaterial color="#0a0f1c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0.12]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.42, 0.02, 0.22]} />
          <meshStandardMaterial
            color="#0a0f1c"
            emissive={GOLD}
            emissiveIntensity={evolution.glowIntensity * 0.08}
          />
        </mesh>
        <mesh position={[0.18, 0.08, -0.08]} rotation={[0.5, 0.6, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.18]} />
          <meshStandardMaterial color="#0a0f1c" />
        </mesh>
        <mesh position={[-0.18, 0.08, -0.08]} rotation={[0.5, -0.6, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.18]} />
          <meshStandardMaterial color="#0a0f1c" />
        </mesh>
        {evolution.hasTricornPlume && (
          <mesh position={[0, 0.16, 0]}>
            <coneGeometry args={[0.04, 0.14, 6]} />
            <meshStandardMaterial
              color={CRIMSON}
              emissive={CRIMSON}
              emissiveIntensity={evolution.glowIntensity * 0.5}
            />
          </mesh>
        )}
      </group>

      {/* Flowing flag cloak */}
      <mesh ref={cloakRef} position={[0, 0.65, -0.18]}>
        <planeGeometry args={[1.1, 1.45, 8, 12]} />
        <meshStandardMaterial
          color={CRIMSON}
          emissive={CRIMSON}
          emissiveIntensity={evolution.glowIntensity * 0.25}
          transparent
          opacity={evolution.cloakOpacity}
          side={THREE.DoubleSide}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0.28, 0.7, -0.17]} rotation={[0, 0, 0.05]}>
        <planeGeometry args={[0.35, 1.35, 1, 1]} />
        <meshStandardMaterial
          color={CREAM}
          transparent
          opacity={evolution.cloakOpacity * 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[-0.28, 0.7, -0.17]} rotation={[0, 0, -0.05]}>
        <planeGeometry args={[0.35, 1.35, 1, 1]} />
        <meshStandardMaterial
          color={BLUE}
          emissive={BLUE}
          emissiveIntensity={evolution.glowIntensity * 0.15}
          transparent
          opacity={evolution.cloakOpacity * 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gold seals orbiting */}
      {Array.from({ length: evolution.sealCount }).map((_, index) => {
        const angle = (index / Math.max(evolution.sealCount, 1)) * Math.PI * 2;
        const y = 0.55 + index * 0.12;
        return (
          <mesh
            key={`seal-${index}`}
            position={[
              Math.cos(angle) * 0.48,
              y,
              Math.sin(angle) * 0.48,
            ]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <torusGeometry args={[0.07, 0.018, 8, 24]} />
            <meshStandardMaterial
              color={GOLD}
              emissive={GOLD}
              emissiveIntensity={evolution.glowIntensity * 0.7}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        );
      })}

      {/* Battle marks */}
      {Array.from({ length: evolution.battleMarks }).map((_, index) => (
        <mesh
          key={`mark-${index}`}
          position={[
            -0.12 + (index % 3) * 0.12,
            0.62 - Math.floor(index / 3) * 0.08,
            0.29,
          ]}
          rotation={[0, 0, -0.4 + index * 0.3]}
        >
          <boxGeometry args={[0.14, 0.015, 0.01]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.35}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Orbiting parchment scrolls */}
      {scrollAngles.map((angle, index) => (
        <Scroll
          key={`scroll-${index}`}
          angle={angle}
          radius={0.62 + index * 0.08}
          y={0.9 + index * 0.05}
          evolution={evolution}
          animate={animate}
        />
      ))}

      {/* Point lights for cinematic glow */}
      <pointLight
        position={[0, 1.2, 0.6]}
        intensity={evolution.glowIntensity * 1.2}
        color={GOLD}
        distance={4}
      />
      <pointLight
        position={[0, 0.4, -0.5]}
        intensity={evolution.glowIntensity * 0.6}
        color={CRIMSON}
        distance={3}
      />
    </group>
  );
}