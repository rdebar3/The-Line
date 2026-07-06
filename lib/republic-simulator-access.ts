import {
  getTrainingPathCapstoneStatus,
  isTrainingPathComplete,
} from "@/lib/learning-path";
import type { ProgressionState } from "@/lib/progression";
import { canAccessRepublicSimulator as hasPremiumOrDemoAccess } from "@/lib/subscription";

export type RepublicSimulatorAccessReason =
  | "granted"
  | "capstone_incomplete"
  | "demo_exhausted";

export type RepublicSimulatorAccess = {
  canPlay: boolean;
  reason: RepublicSimulatorAccessReason;
  capstoneComplete: boolean;
  premiumOrDemoAvailable: boolean;
};

export function getRepublicSimulatorAccess(
  state: ProgressionState,
  isPremium: boolean,
  demoUsed: boolean
): RepublicSimulatorAccess {
  const capstoneComplete = isTrainingPathComplete(state);
  const premiumOrDemoAvailable = hasPremiumOrDemoAccess(isPremium, demoUsed);

  if (!capstoneComplete) {
    return {
      canPlay: false,
      reason: "capstone_incomplete",
      capstoneComplete,
      premiumOrDemoAvailable,
    };
  }

  if (!premiumOrDemoAvailable) {
    return {
      canPlay: false,
      reason: "demo_exhausted",
      capstoneComplete,
      premiumOrDemoAvailable,
    };
  }

  return {
    canPlay: true,
    reason: "granted",
    capstoneComplete,
    premiumOrDemoAvailable,
  };
}

export { getTrainingPathCapstoneStatus, isTrainingPathComplete };