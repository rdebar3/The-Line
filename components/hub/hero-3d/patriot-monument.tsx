"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { GUARDIAN_IMAGE } from "@/lib/guardian";

const GOLD = "#c9a227";
const NAVY = "#0c1220";

/** Monument sits left of center so the overlay panel doesn't cover it. */
export const MONUMENT_ANCHOR: [number, number, number] = [-2.4, -0.2, 0];

function goldTrimMaterial() {
  return new THREE.MeshStandardMaterial({
    color: GOLD,
    metalness: 0.95,
    roughness: 0.18,
    emissive: GOLD,
    emissiveIntensity: 0.35,
  });
}

function MonumentFrame() {
  const columnMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: NAVY,
        metalness: 0.85,
        roughness: 0.3,
        emissive: GOLD,
        emissiveIntensity: 0.18,
      }),
    []
  );
  const trimMat = useMemo(() => goldTrimMaterial(), []);

  return (
    <group position={[0, 0.35, -0.05]}>
      {/* Side walls — depth so the alcove reads as 3D, not a flat card */}
      <mesh position={[-1.35, 1.05, -0.22]} material={columnMat}>
        <boxGeometry args={[0.12, 2.4, 0.45]} />
      </mesh>
      <mesh position={[1.35, 1.05, -0.22]} material={columnMat}>
        <boxGeometry args={[0.12, 2.4, 0.45]} />
      </mesh>
      <mesh position={[0, 1.05, -0.42]}>
        <boxGeometry args={[2.72, 2.4, 0.08]} />
        <meshStandardMaterial
          color="#030508"
          metalness={0.5}
          roughness={0.85}
          emissive="#0f1525"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Front columns */}
      <mesh position={[-1.45, 0.95, 0.12]} material={columnMat}>
        <boxGeometry args={[0.28, 2.6, 0.32]} />
      </mesh>
      <mesh position={[1.45, 0.95, 0.12]} material={columnMat}>
        <boxGeometry args={[0.28, 2.6, 0.32]} />
      </mesh>

      {/* Column capitals */}
      <mesh position={[-1.45, 2.35, 0.12]} material={trimMat}>
        <boxGeometry args={[0.38, 0.14, 0.42]} />
      </mesh>
      <mesh position={[1.45, 2.35, 0.12]} material={trimMat}>
        <boxGeometry args={[0.38, 0.14, 0.42]} />
      </mesh>

      {/* Lintel + gold trim */}
      <mesh position={[0, 2.48, 0.1]} material={columnMat}>
        <boxGeometry args={[3.35, 0.22, 0.36]} />
      </mesh>
      <mesh position={[0, 2.58, 0.14]} material={trimMat}>
        <boxGeometry args={[3.45, 0.06, 0.1]} />
      </mesh>

      {/* Base sill */}
      <mesh position={[0, -0.12, 0.14]} material={trimMat}>
        <boxGeometry args={[3.2, 0.1, 0.28]} />
      </mesh>

      {/* Inner alcove recess */}
      <mesh position={[0, 1.0, -0.08]}>
        <boxGeometry args={[2.5, 2.35, 0.2]} />
        <meshStandardMaterial
          color="#020408"
          metalness={0.45}
          roughness={0.82}
          emissive="#141c30"
          emissiveIntensity={0.22}
        />
      </mesh>
    </group>
  );
}

function Pedestal() {
  const trimMat = useMemo(() => goldTrimMaterial(), []);

  return (
    <group position={[0, -0.35, 0.15]}>
      {/* Wide base step */}
      <mesh position={[0, -0.52, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.16, 1.6]} />
        <meshStandardMaterial
          color={NAVY}
          metalness={0.9}
          roughness={0.28}
          emissive="#1e2a45"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, -0.44, 0.02]} material={trimMat}>
        <boxGeometry args={[3.5, 0.04, 1.68]} />
      </mesh>

      <mesh position={[0, -0.32, 0]} receiveShadow>
        <cylinderGeometry args={[1.75, 1.95, 0.22, 48]} />
        <meshStandardMaterial
          color={NAVY}
          metalness={0.9}
          roughness={0.28}
          emissive="#1e2a45"
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[1.4, 1.55, 0.2, 48]} />
        <meshStandardMaterial
          color="#121a2e"
          metalness={0.88}
          roughness={0.32}
          emissive={GOLD}
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[1.1, 1.22, 0.16, 48]} />
        <meshStandardMaterial
          color="#1a2438"
          metalness={0.92}
          roughness={0.25}
          emissive={GOLD}
          emissiveIntensity={0.14}
        />
      </mesh>
    </group>
  );
}

export function PatriotMonument() {
  const group = useRef<THREE.Group>(null);
  const texture = useTexture(GUARDIAN_IMAGE);

  const portraitMaterial = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      toneMapped: true,
    });
  }, [texture]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y =
      MONUMENT_ANCHOR[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.025;
  });

  return (
    <group
      ref={group}
      position={MONUMENT_ANCHOR}
      scale={1.15}
    >
      <ContactShadows
        position={[0, -0.72, 0.15]}
        opacity={0.6}
        scale={16}
        blur={3}
        far={6}
        color="#04060c"
      />

      <Pedestal />
      <MonumentFrame />

      {/* Portrait recessed inside alcove — lowered so the head stays in frame */}
      <mesh
        position={[0, 0.62, -0.02]}
        rotation={[0, 0.06, 0]}
        material={portraitMaterial}
      >
        <planeGeometry args={[1.65, 2.42]} />
      </mesh>

      <spotLight
        position={[1.5, 3, 2.5]}
        angle={0.45}
        penumbra={0.85}
        intensity={2.5}
        color="#f5e6a8"
        castShadow
      />
      <spotLight
        position={[-3, 2, 1.5]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        color="#6b8cce"
      />
      <pointLight position={[0, 1.2, 1.8]} intensity={1.1} color={GOLD} distance={8} />
    </group>
  );
}