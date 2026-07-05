"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { GUARDIAN_IMAGE } from "@/lib/guardian";

export function PatriotMonument() {
  const group = useRef<THREE.Group>(null);
  const portrait = useRef<THREE.Group>(null);
  const texture = useTexture(GUARDIAN_IMAGE);

  const portraitMaterial = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: true,
      toneMapped: true,
    });
  }, [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.7) * 0.05;
    }
    if (portrait.current) {
      portrait.current.rotation.z = Math.sin(t * 0.4) * 0.015;
    }
  });

  return (
    <group ref={group} position={[-1.4, -1.1, 0]} scale={1.65}>
      <ContactShadows
        position={[0, -1.72, 0]}
        opacity={0.45}
        scale={12}
        blur={2.5}
        far={4}
        color="#060a14"
      />

      {/* Pedestal */}
      <mesh position={[0, -1.55, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.55, 0.35, 48]} />
        <meshStandardMaterial
          color="#0c1220"
          metalness={0.85}
          roughness={0.35}
          emissive="#1a2438"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, -1.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.38, 64]} />
        <meshStandardMaterial
          color="#c9a227"
          emissive="#c9a227"
          emissiveIntensity={0.12}
          metalness={0.9}
          roughness={0.4}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Dark backdrop — hides flat photo edges */}
      <mesh position={[0, 1.15, -0.55]}>
        <planeGeometry args={[2.8, 3.6]} />
        <meshBasicMaterial color="#04060c" transparent opacity={0.92} />
      </mesh>

      {/* Soft aura (not a ring outline) */}
      <mesh position={[0, 1.2, -0.65]}>
        <planeGeometry args={[3.4, 4.2]} />
        <meshBasicMaterial
          color="#c9a227"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.2, -0.6]}>
        <planeGeometry args={[3, 3.8]} />
        <meshBasicMaterial
          color="#b91c1c"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Portrait */}
      <Billboard follow position={[0, 1.05, 0]}>
        <group ref={portrait}>
          <mesh material={portraitMaterial}>
            <planeGeometry args={[2.1, 3.15]} />
          </mesh>
        </group>
      </Billboard>

      {/* Rim lights on the figure */}
      <spotLight
        position={[1.5, 3, 2.5]}
        angle={0.45}
        penumbra={0.8}
        intensity={2.5}
        color="#f5e6a8"
        castShadow={false}
      />
      <spotLight
        position={[-2, 2, 1]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#3b5998"
        castShadow={false}
      />
      <pointLight position={[0, 0.5, 2]} intensity={0.8} color="#c9a227" distance={6} />
    </group>
  );
}