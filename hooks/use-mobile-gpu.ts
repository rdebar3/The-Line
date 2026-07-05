"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(max-width: 768px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return narrow || coarse;
}

function getServerSnapshot() {
  return false;
}

/** Reduce post-processing and geometry on mobile / touch devices. */
export function useMobileGpu() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}