"use client";

import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

import { AmbientParticles } from "@/components/command-center-3d/shared/ambient-particles";
import { FloatingFlag } from "@/components/command-center-3d/shared/floating-flag";
import { getWarRoomY, PALETTE } from "@/lib/command-center-3d/constants";

function RoomLabel({ y, label }: { y: number; label: string }) {
  return (
    <Text
      position={[0, y + 5.5, 0]}
      fontSize={0.35}
      color={PALETTE.gold}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#060a14"
    >
      {label.toUpperCase()}
    </Text>
  );
}

function CommandHubRoom({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[2.5, 4.5, 48]} />
        <meshStandardMaterial
          color={PALETTE.gold}
          emissive={PALETTE.gold}
          emissiveIntensity={0.35}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.8, 2.2, 0.4, 32]} />
        <meshStandardMaterial
          color={PALETTE.navy}
          emissive={PALETTE.gold}
          emissiveIntensity={0.12}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3.2, 1.2, Math.sin(angle) * 3.2]}
          >
            <boxGeometry args={[0.15, 2.4, 0.15]} />
            <meshStandardMaterial
              color={PALETTE.gold}
              emissive={PALETTE.gold}
              emissiveIntensity={0.4}
            />
          </mesh>
        );
      })}
      <AmbientParticles count={80} spread={10} position={[0, 2, 0]} />
      <pointLight position={[0, 3, 0]} intensity={2} color={PALETTE.gold} distance={12} />
      <RoomLabel y={0} label="Command Hub" />
    </group>
  );
}

function ArchivesRoom({ y }: { y: number }) {
  const docs = [
    { pos: [-2.5, 1.5, 0] as [number, number, number], rot: 0.2, color: PALETTE.gold },
    { pos: [0, 2, -1] as [number, number, number], rot: 0, color: PALETTE.blue },
    { pos: [2.5, 1.5, 0.5] as [number, number, number], rot: -0.15, color: PALETTE.crimson },
  ];

  return (
    <group position={[0, y, 0]}>
      {docs.map((doc, i) => (
        <Float key={i} speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <mesh position={doc.pos} rotation={[0.1, doc.rot, 0.05]}>
            <planeGeometry args={[1.4, 1.9]} />
            <meshStandardMaterial
              color="#2a2318"
              emissive={doc.color}
              emissiveIntensity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color={PALETTE.navy}
          emissive={PALETTE.blue}
          emissiveIntensity={0.05}
        />
      </mesh>
      <AmbientParticles count={60} spread={8} color={PALETTE.blue} />
      <pointLight position={[0, 4, 2]} intensity={1.5} color={PALETTE.blue} distance={14} />
      <RoomLabel y={0} label="Archives Room" />
    </group>
  );
}

function TrainingBayRoom({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[12, 12, 12, 12]} />
        <meshStandardMaterial
          color={PALETTE.navy}
          emissive={PALETTE.crimson}
          emissiveIntensity={0.08}
          wireframe
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={1.5} floatIntensity={0.5}>
          <mesh position={[(i - 1) * 2.5, 1.8, -1]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={PALETTE.crimson}
              emissive={PALETTE.crimson}
              emissiveIntensity={0.5}
              wireframe
            />
          </mesh>
        </Float>
      ))}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 0.05, 2]} />
        <meshStandardMaterial
          color={PALETTE.gold}
          emissive={PALETTE.gold}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <AmbientParticles count={70} spread={9} color={PALETTE.crimson} />
      <pointLight position={[0, 3, 0]} intensity={1.8} color={PALETTE.crimson} distance={12} />
      <RoomLabel y={0} label="Training Bay" />
    </group>
  );
}

function StrategyChamberRoom({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 1.5, -2]}>
        <sphereGeometry args={[1.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={PALETTE.navy}
          emissive={PALETTE.blue}
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.5, 2.8, 0.3, 6]} />
        <meshStandardMaterial
          color="#1e2438"
          emissive={PALETTE.gold}
          emissiveIntensity={0.15}
        />
      </mesh>
      <FloatingFlag position={[3, 2.5, -1]} scale={1.8} />
      <AmbientParticles count={50} spread={7} color={PALETTE.blue} />
      <spotLight
        position={[0, 6, 4]}
        angle={0.4}
        penumbra={0.5}
        intensity={2}
        color={PALETTE.gold}
        castShadow={false}
      />
      <RoomLabel y={0} label="Strategy Chamber" />
    </group>
  );
}

function MemorialHallRoom({ y }: { y: number }) {
  const frames = [-3, -1, 1, 3];
  return (
    <group position={[0, y, 0]}>
      {frames.map((x, i) => (
        <group key={i} position={[x, 1.5, -2]}>
          <mesh>
            <boxGeometry args={[1.2, 1.6, 0.08]} />
            <meshStandardMaterial
              color={PALETTE.gold}
              emissive={PALETTE.gold}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial
              color={PALETTE.navy}
              emissive={i % 2 === 0 ? PALETTE.gold : PALETTE.crimson}
              emissiveIntensity={0.15}
            />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={PALETTE.navy} />
      </mesh>
      <AmbientParticles count={90} spread={11} />
      <pointLight position={[0, 4, 0]} intensity={1.6} color={PALETTE.gold} distance={16} />
      <RoomLabel y={0} label="Memorial Hall" />
    </group>
  );
}

export function WarRooms() {
  return (
    <>
      <CommandHubRoom y={getWarRoomY(0)} />
      <ArchivesRoom y={getWarRoomY(1)} />
      <TrainingBayRoom y={getWarRoomY(2)} />
      <StrategyChamberRoom y={getWarRoomY(3)} />
      <MemorialHallRoom y={getWarRoomY(4)} />
    </>
  );
}