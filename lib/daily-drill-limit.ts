import { getTodayDateString } from "@/lib/grok-teaser";
import { buildUserStorageKey } from "@/lib/user-scope";

export const DAILY_DRILL_STORAGE_KEY = "theline_daily_drills";
export const FREE_DAILY_DRILL_LIMIT = 5;

export type DailyDrillState = {
  date: string;
  drillsCompleted: number;
};

export function readDailyDrillState(): DailyDrillState {
  if (typeof window === "undefined") {
    return emptyDailyDrillState();
  }

  try {
    const raw = localStorage.getItem(
      buildUserStorageKey(DAILY_DRILL_STORAGE_KEY)
    );
    if (!raw) {
      return emptyDailyDrillState();
    }

    const parsed = JSON.parse(raw) as Partial<DailyDrillState>;
    const today = getTodayDateString();

    if (parsed.date !== today) {
      return emptyDailyDrillState();
    }

    return {
      date: today,
      drillsCompleted:
        typeof parsed.drillsCompleted === "number" ? parsed.drillsCompleted : 0,
    };
  } catch {
    return emptyDailyDrillState();
  }
}

function emptyDailyDrillState(): DailyDrillState {
  return {
    date: getTodayDateString(),
    drillsCompleted: 0,
  };
}

export function writeDailyDrillState(state: DailyDrillState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(DAILY_DRILL_STORAGE_KEY),
    JSON.stringify(state)
  );
}

export function getDailyDrillsRemaining(
  drillsCompleted = readDailyDrillState().drillsCompleted,
  isPremium = false
): number {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_DAILY_DRILL_LIMIT - drillsCompleted);
}

export function canTakeDailyDrill(isPremium = false): boolean {
  if (isPremium) return true;
  return getDailyDrillsRemaining() > 0;
}

export function recordDailyDrill(isPremium = false): DailyDrillState {
  if (isPremium) {
    return readDailyDrillState();
  }

  const state = readDailyDrillState();
  const next: DailyDrillState = {
    date: getTodayDateString(),
    drillsCompleted: state.drillsCompleted + 1,
  };

  writeDailyDrillState(next);
  return next;
}

export function getMillisecondsUntilMidnight(now = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, midnight.getTime() - now.getTime());
}

export function formatMidnightCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}