"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

import {
  WAR_ROOM_COUNT,
  WAR_ROOM_SPACING,
} from "@/lib/command-center-3d/constants";

export function CameraRig() {
  const scroll = useScroll();
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const maxY = (WAR_ROOM_COUNT - 1) * WAR_ROOM_SPACING;
    const y = -scroll.offset * maxY;
    const desired = new THREE.Vector3(0, y + 2.5, 9);
    const lookAt = new THREE.Vector3(0, y, 0);

    camera.position.lerp(desired, 1 - Math.exp(-4 * delta));
    lookTarget.current.lerp(lookAt, 1 - Math.exp(-4 * delta));
    camera.lookAt(lookTarget.current);
  });

  return null;
}