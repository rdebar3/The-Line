"use client";

import { Suspense } from "react";
import { Scroll, ScrollControls } from "@react-three/drei";

import { CameraRig } from "@/components/command-center-3d/camera-rig";
import { PostProcessingEffects } from "@/components/command-center-3d/post-processing";
import { WarRooms } from "@/components/command-center-3d/rooms/war-rooms";
import { ScrollSections } from "@/components/command-center-3d/scroll/scroll-sections";
import { WAR_ROOM_COUNT } from "@/lib/command-center-3d/constants";

export function ImmersiveScene() {
  return (
    <>
      <fog attach="fog" args={["#060a14", 8, 55]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 10, 6]} intensity={0.45} color="#c9a227" />
      <directionalLight position={[-4, 6, -4]} intensity={0.2} color="#3b5998" />

      <ScrollControls pages={WAR_ROOM_COUNT} damping={0.22} distance={1}>
        <CameraRig />
        <Suspense fallback={null}>
          <WarRooms />
        </Suspense>
        <Scroll html style={{ width: "100%" }}>
          <ScrollSections />
        </Scroll>
      </ScrollControls>

      <PostProcessingEffects />
    </>
  );
}