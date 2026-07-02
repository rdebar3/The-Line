import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export type PremiumMetadata = {
  premium?: boolean;
  premiumPurchasedAt?: string;
};

export type PremiumState = {
  isPremium: boolean;
  purchasedAt: string | null;
};

export type DailyMissionProgress = {
  completed: boolean;
  progress: number;
  target: number;
};

export function isPremiumFromMetadata(
  metadata: PremiumMetadata | null | undefined
): boolean {
  return metadata?.premium === true;
}

export function readClerkPremiumState(
  metadata: PremiumMetadata | null | undefined
): PremiumState {
  return {
    isPremium: isPremiumFromMetadata(metadata),
    purchasedAt: metadata?.premiumPurchasedAt ?? null,
  };
}

/** Prefer Clerk metadata, then local cache — used while API sync is pending or failed. */
export function getOptimisticPremiumState(
  clerk: PremiumState,
  local: PremiumState
): PremiumState {
  if (clerk.isPremium) return clerk;
  if (local.isPremium) return local;
  return { isPremium: false, purchasedAt: null };
}

export function getTrainingCtaLabel(options: {
  isPremium: boolean;
  dailyMission?: DailyMissionProgress | null;
  isGuest?: boolean;
}): string {
  const { isPremium, dailyMission, isGuest = false } = options;

  if (dailyMission && !dailyMission.completed) {
    return `Continue Training — ${dailyMission.progress}/${dailyMission.target} Mission`;
  }

  if (isPremium) {
    return "Enter Training";
  }

  if (isGuest) {
    return `Start Free Training (${FREE_DAILY_SCENARIO_GENERATION_LIMIT} Scenarios)`;
  }

  return `Start Training — ${FREE_DAILY_SCENARIO_GENERATION_LIMIT} Free Scenarios/Day`;
}