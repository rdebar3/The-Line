import { buildUserStorageKey } from "@/lib/user-scope";

export const REPUBLIC_SIMULATOR_DEMO_KEY = "theline_republic_simulator_demo_used";

export function readRepublicSimulatorDemoUsed(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(buildUserStorageKey(REPUBLIC_SIMULATOR_DEMO_KEY)) ===
    "true"
  );
}

export function writeRepublicSimulatorDemoUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(REPUBLIC_SIMULATOR_DEMO_KEY),
    "true"
  );
}