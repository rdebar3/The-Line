import { CHARACTER_NAME } from "@/lib/guardian";
import { FREE_GROK_DAILY_LIMIT } from "@/lib/grok-teaser";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { buildUserStorageKey } from "@/lib/user-scope";

export const PREMIUM_PRICE = 7.99;
export const PREMIUM_PRICE_LABEL = "$7.99";
export const UNLOCK_CTA_LABEL = `Unlock for ${PREMIUM_PRICE_LABEL}`;
export const UNLOCK_FULL_LABEL = `Unlock Full Experience — ${PREMIUM_PRICE_LABEL}`;

export const STORAGE_KEY = "theline_premium";
export const PURCHASE_DATE_KEY = "theline_premium_purchased_at";

export type PremiumFeature =
  | "grok_chat"
  | "grok_progression"
  | "all_scenarios"
  | "full_arsenal"
  | "unlimited_passages";

/** Daily free-tier cap for fresh Grok scenarios */
export const FREE_SCENARIO_LIMIT = FREE_DAILY_SCENARIO_GENERATION_LIMIT;
export const FREE_PASSAGE_LIMIT = 3;

export const TIER_COMPARISON = [
  {
    label: `${CHARACTER_NAME} counsel`,
    free: "3 short questions per day",
    full: "Unlimited deep constitutional analysis",
  },
  {
    label: "Training scenarios",
    free: `${FREE_DAILY_SCENARIO_GENERATION_LIMIT} Grok scenarios/day`,
    full: "Unlimited rank-scaled Grok sessions",
  },
  {
    label: "Founding documents",
    free: `${FREE_PASSAGE_LIMIT} passages per document`,
    full: "Unlimited passage depth",
  },
  {
    label: "Tactical training",
    free: "Not included",
    full: `Personalized missions from ${CHARACTER_NAME}`,
  },
  {
    label: "Constitutional Arsenal",
    free: "Locked",
    full: "Full defense scripts & tools",
  },
] as const;

export type PremiumState = {
  isPremium: boolean;
  purchasedAt: string | null;
};

export function readPremiumState(): PremiumState {
  if (typeof window === "undefined") {
    return { isPremium: false, purchasedAt: null };
  }

  const isPremium =
    localStorage.getItem(buildUserStorageKey(STORAGE_KEY)) === "true";
  const purchasedAt = localStorage.getItem(
    buildUserStorageKey(PURCHASE_DATE_KEY)
  );

  return { isPremium, purchasedAt };
}

export function writePremiumState(purchasedAt: string = new Date().toISOString()) {
  localStorage.setItem(buildUserStorageKey(STORAGE_KEY), "true");
  localStorage.setItem(buildUserStorageKey(PURCHASE_DATE_KEY), purchasedAt);
}

export function clearPremiumState() {
  localStorage.removeItem(buildUserStorageKey(STORAGE_KEY));
  localStorage.removeItem(buildUserStorageKey(PURCHASE_DATE_KEY));
}

export function hasFeature(
  isPremium: boolean,
  feature: PremiumFeature
): boolean {
  if (isPremium) return true;

  switch (feature) {
    case "grok_chat":
    case "grok_progression":
    case "all_scenarios":
    case "full_arsenal":
    case "unlimited_passages":
      return false;
    default:
      return false;
  }
}

export const FREE_VS_PREMIUM_ROWS = [
  {
    label: `${CHARACTER_NAME} counsel`,
    free: `${FREE_GROK_DAILY_LIMIT} short answers/day`,
    full: "Unlimited deep constitutional analysis",
  },
  {
    label: "Training scenarios",
    free: `${FREE_DAILY_SCENARIO_GENERATION_LIMIT} fresh scenarios/day`,
    full: "Unlimited dynamic sessions",
  },
  {
    label: "Founding documents",
    free: `${FREE_PASSAGE_LIMIT} passages per document`,
    full: "Every passage, full depth",
  },
  {
    label: "Tactical training",
    free: "Locked",
    full: "Personalized missions & rank debriefs",
  },
  {
    label: "Constitutional Arsenal",
    free: "Locked",
    full: "Full defense scripts & tools",
  },
] as const;

export const PREMIUM_FEATURES = [
  {
    title: `${CHARACTER_NAME} Tactical Training`,
    description:
      `Personalized missions, weak-area drills, and rank promotion commentary from ${CHARACTER_NAME} via Grok.`,
  },
  {
    title: `Ask ${CHARACTER_NAME} About Your Rights`,
    description:
      `Unlimited constitutional counsel from ${CHARACTER_NAME} via Grok — free version includes ${FREE_GROK_DAILY_LIMIT} teaser questions per day.`,
  },
  {
    title: "Unlimited Grok Training Sessions",
    description:
      `Unlimited open-ended training sessions with fresh, rank-scaled scenarios and deep personalization from ${CHARACTER_NAME}.`,
  },
  {
    title: "Full Constitutional Arsenal",
    description:
      "Defense scripts, case law references, and practical tools for real-world situations.",
  },
  {
    title: "Unlimited Passage Depth",
    description:
      "Every explanation, historical context, and modern relevance across all founding documents.",
  },
] as const;