import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { getTodayDateString } from "@/lib/grok-teaser";
import { buildUserStorageKey } from "@/lib/user-scope";

export const SCENARIO_GENERATION_STORAGE_KEY = "theline_scenario_generation";

export type ScenarioGenerationState = {
  date: string;
  scenariosGenerated: number;
  sessionsStarted: number;
  recentTopicIds: string[];
  recentScenarioTitles: string[];
};

export function readScenarioGenerationState(): ScenarioGenerationState {
  if (typeof window === "undefined") {
    return emptyGenerationState();
  }

  try {
    const raw = localStorage.getItem(
      buildUserStorageKey(SCENARIO_GENERATION_STORAGE_KEY)
    );
    if (!raw) {
      return emptyGenerationState();
    }

    const parsed = JSON.parse(raw) as Partial<ScenarioGenerationState>;
    const today = getTodayDateString();

    if (parsed.date !== today) {
      return {
        ...emptyGenerationState(),
        recentTopicIds: Array.isArray(parsed.recentTopicIds)
          ? parsed.recentTopicIds.slice(-30)
          : [],
        recentScenarioTitles: Array.isArray(parsed.recentScenarioTitles)
          ? parsed.recentScenarioTitles.slice(-30)
          : [],
      };
    }

    return {
      date: today,
      scenariosGenerated:
        typeof parsed.scenariosGenerated === "number"
          ? parsed.scenariosGenerated
          : 0,
      sessionsStarted:
        typeof parsed.sessionsStarted === "number" ? parsed.sessionsStarted : 0,
      recentTopicIds: Array.isArray(parsed.recentTopicIds)
        ? parsed.recentTopicIds
        : [],
      recentScenarioTitles: Array.isArray(parsed.recentScenarioTitles)
        ? parsed.recentScenarioTitles
        : [],
    };
  } catch {
    return emptyGenerationState();
  }
}

function emptyGenerationState(): ScenarioGenerationState {
  return {
    date: getTodayDateString(),
    scenariosGenerated: 0,
    sessionsStarted: 0,
    recentTopicIds: [],
    recentScenarioTitles: [],
  };
}

export function writeScenarioGenerationState(state: ScenarioGenerationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(SCENARIO_GENERATION_STORAGE_KEY),
    JSON.stringify(state)
  );
}

export function getRemainingScenarioGenerations(
  isPremium: boolean,
  scenariosGenerated = readScenarioGenerationState().scenariosGenerated
): number {
  if (isPremium) return Infinity;
  return Math.max(
    0,
    FREE_DAILY_SCENARIO_GENERATION_LIMIT - scenariosGenerated
  );
}

export function canStartGrokSession(isPremium: boolean): boolean {
  if (isPremium) return true;
  return getRemainingScenarioGenerations(isPremium) > 0;
}

export function canGenerateNextScenario(
  isPremium: boolean,
  scenariosGenerated = readScenarioGenerationState().scenariosGenerated
): boolean {
  if (isPremium) return true;
  return getRemainingScenarioGenerations(false, scenariosGenerated) > 0;
}

export function recordScenarioGeneration(
  count: number,
  isPremium: boolean,
  meta?: { topicIds?: string[]; titles?: string[]; isNewSession?: boolean }
): ScenarioGenerationState {
  const state = readScenarioGenerationState();
  const topicIds = meta?.topicIds ?? [];
  const titles = meta?.titles ?? [];

  const next: ScenarioGenerationState = {
    ...state,
    date: getTodayDateString(),
    scenariosGenerated: isPremium
      ? state.scenariosGenerated
      : state.scenariosGenerated + count,
    sessionsStarted:
      state.sessionsStarted + (meta?.isNewSession ? 1 : 0),
    recentTopicIds: [...state.recentTopicIds, ...topicIds].slice(-40),
    recentScenarioTitles: [...state.recentScenarioTitles, ...titles].slice(-40),
  };

  writeScenarioGenerationState(next);
  return next;
}