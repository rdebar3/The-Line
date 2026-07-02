import { getTodayDateString } from "@/lib/grok-teaser";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const STORAGE_PREFIX = "theline:daily-limit-modal-shown:";

export function getDailyLimitModalStorageKey(date = getTodayDateString()) {
  return `${STORAGE_PREFIX}${date}`;
}

export function wasDailyLimitModalShownToday(date = getTodayDateString()) {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(getDailyLimitModalStorageKey(date)) === "1";
}

export function markDailyLimitModalShown(date = getTodayDateString()) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getDailyLimitModalStorageKey(date), "1");
}

export function shouldOfferDailyLimitModal(options: {
  isSignedIn: boolean;
  isPremium: boolean;
  scenariosGenerated: number;
}) {
  if (!options.isSignedIn || options.isPremium) return false;
  return options.scenariosGenerated >= FREE_DAILY_SCENARIO_GENERATION_LIMIT;
}