import type { MilitaryRank, MilitaryRankId } from "@/lib/progression";

export type ScenarioDifficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_LABELS: Record<
  ScenarioDifficulty,
  { label: string; subtitle: string; badge: string }
> = {
  easy: {
    label: "Foundational",
    subtitle: "Private through Sergeant — clear principles from any founding document.",
    badge: "EASY",
  },
  medium: {
    label: "Field Grade",
    subtitle: "Staff Sergeant & MSG — nuanced cross-document application.",
    badge: "MEDIUM",
  },
  hard: {
    label: "Command Level",
    subtitle: "Lieutenant+ — multi-document synthesis under modern pressure.",
    badge: "HARD",
  },
};

const EASY_RANKS: MilitaryRankId[] = [
  "private",
  "pfc",
  "specialist",
  "corporal",
  "sergeant",
];
const MEDIUM_RANKS: MilitaryRankId[] = ["staff_sergeant", "master_sergeant"];

export function getDifficultyForRank(rankId: MilitaryRankId): ScenarioDifficulty {
  if (EASY_RANKS.includes(rankId)) return "easy";
  if (MEDIUM_RANKS.includes(rankId)) return "medium";
  return "hard";
}

export function getDifficultyForRankObject(rank: MilitaryRank): ScenarioDifficulty {
  return getDifficultyForRank(rank.id);
}

/** One fresh scenario is generated per request — sessions are open-ended. */
export const SCENARIOS_PER_REQUEST = 1;

export const FREE_DAILY_SCENARIO_GENERATION_LIMIT = 5;

/** @deprecated Sessions are dynamic; use SCENARIOS_PER_REQUEST and daily limit instead. */
export const FREE_SCENARIOS_PER_SESSION = SCENARIOS_PER_REQUEST;

/** @deprecated Sessions are dynamic; premium is unlimited scenarios per day. */
export const PREMIUM_SCENARIOS_PER_SESSION = SCENARIOS_PER_REQUEST;

export function getScenariosPerRequest(): number {
  return SCENARIOS_PER_REQUEST;
}