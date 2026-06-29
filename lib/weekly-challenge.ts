import { CURRICULUM_TOPICS } from "@/lib/scenario-curriculum";

export type WeeklyChallengeState = {
  weekId: string;
  participated: boolean;
  bestScore: number;
  completedAt: string | null;
};

export type WeeklyChallengeTemplate = {
  weekIndex: number;
  title: string;
  focus: string;
  topicId: string;
  description: string;
};

export function getWeekId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getWeeklyChallenge(date = new Date()): WeeklyChallengeTemplate {
  const weekId = getWeekId(date);
  const weekIndex = Number(weekId.split("-W")[1] ?? "1");
  const topic = CURRICULUM_TOPICS[weekIndex % CURRICULUM_TOPICS.length]!;

  return {
    weekIndex,
    title: `Week ${weekIndex}: ${topic.amendmentLabel}`,
    focus: topic.label,
    topicId: topic.id,
    description: `Everyone faces the same constitutional focus this week — ${topic.label}. Train under pressure and climb the weekly board.`,
  };
}

export function createInitialWeeklyChallengeState(): WeeklyChallengeState {
  return {
    weekId: getWeekId(),
    participated: false,
    bestScore: 0,
    completedAt: null,
  };
}

export function refreshWeeklyChallengeState(
  state: WeeklyChallengeState
): WeeklyChallengeState {
  const currentWeek = getWeekId();
  if (state.weekId === currentWeek) return state;
  return createInitialWeeklyChallengeState();
}

export function recordWeeklyParticipation(
  state: WeeklyChallengeState,
  sessionScore: number
): WeeklyChallengeState {
  const refreshed = refreshWeeklyChallengeState(state);
  return {
    weekId: refreshed.weekId,
    participated: true,
    bestScore: Math.max(refreshed.bestScore, sessionScore),
    completedAt: new Date().toISOString(),
  };
}