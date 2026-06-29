import {
  createInitialOnboardingState,
  type OnboardingGoal,
  type OnboardingState,
} from "@/lib/onboarding-path";
import { getEarnedBadges } from "@/lib/mastery-tracks";
import {
  createInitialWeeklyChallengeState,
  recordWeeklyParticipation,
  refreshWeeklyChallengeState,
  type WeeklyChallengeState,
} from "@/lib/weekly-challenge";


export const PROGRESSION_STORAGE_KEY = "theline_progression";

export type MilitaryRankId =
  | "private"
  | "pfc"
  | "specialist"
  | "corporal"
  | "sergeant"
  | "staff_sergeant"
  | "master_sergeant"
  | "lieutenant"
  | "captain"
  | "major";

export type MilitaryRank = {
  id: MilitaryRankId;
  title: string;
  abbreviation: string;
  minScore: number;
  insignia: string;
  color: string;
};

export const MILITARY_RANKS: MilitaryRank[] = [
  {
    id: "private",
    title: "Private",
    abbreviation: "PVT",
    minScore: 0,
    insignia: "★",
    color: "#7a8ba8",
  },
  {
    id: "pfc",
    title: "Private First Class",
    abbreviation: "PFC",
    minScore: 500,
    insignia: "★",
    color: "#8b9cb5",
  },
  {
    id: "specialist",
    title: "Specialist",
    abbreviation: "SPC",
    minScore: 1100,
    insignia: "★★",
    color: "#9aabbf",
  },
  {
    id: "corporal",
    title: "Corporal",
    abbreviation: "CPL",
    minScore: 1900,
    insignia: "⬥⬥",
    color: "#c9a227",
  },
  {
    id: "sergeant",
    title: "Sergeant",
    abbreviation: "SGT",
    minScore: 3000,
    insignia: "⬥⬥⬥",
    color: "#d4b23a",
  },
  {
    id: "staff_sergeant",
    title: "Staff Sergeant",
    abbreviation: "SSG",
    minScore: 4500,
    insignia: "▬▬",
    color: "#e0c04a",
  },
  {
    id: "master_sergeant",
    title: "Master Sergeant",
    abbreviation: "MSG",
    minScore: 6500,
    insignia: "▬▬▬",
    color: "#f0d060",
  },
  {
    id: "lieutenant",
    title: "Lieutenant",
    abbreviation: "LT",
    minScore: 9000,
    insignia: "◆",
    color: "#b91c1c",
  },
  {
    id: "captain",
    title: "Captain",
    abbreviation: "CPT",
    minScore: 12000,
    insignia: "◆◆",
    color: "#dc2626",
  },
  {
    id: "major",
    title: "Major",
    abbreviation: "MAJ",
    minScore: 16000,
    insignia: "◆◆◆",
    color: "#ef4444",
  },
];

export type DailyMissionType =
  | "complete_scenario"
  | "correct_answers"
  | "defend_streak"
  | "hub_training";

export type DailyMissionTemplate = {
  id: DailyMissionType;
  title: string;
  description: string;
  target: number;
  reward: number;
};

export const DAILY_MISSION_TEMPLATES: DailyMissionTemplate[] = [
  {
    id: "complete_scenario",
    title: "Field Exercise",
    description: "Complete at least one constitutional scenario today.",
    target: 1,
    reward: 50,
  },
  {
    id: "correct_answers",
    title: "Precision Fire",
    description: "Answer 2 scenario questions correctly today.",
    target: 2,
    reward: 75,
  },
  {
    id: "defend_streak",
    title: "Hold the Line",
    description: "Maintain your daily activity streak with any training.",
    target: 1,
    reward: 40,
  },
  {
    id: "hub_training",
    title: "Reconnaissance",
    description: "Log training activity from the hub today.",
    target: 1,
    reward: 30,
  },
];

export type ScenarioAnswerRecord = {
  scenarioId: string;
  amendment: string;
  correct: boolean;
  answeredAt: string;
};

export type GrokMission = {
  id: string;
  title: string;
  focusArea: string;
  scenario: string;
  question: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  createdAt: string;
  completed: boolean;
};

export type ProgressionState = {
  defenderScore: number;
  dailyStreak: number;
  longestStreak: number;
  correctStreak: number;
  lastActivityDate: string | null;
  lastRankId: MilitaryRankId;
  scenarioHistory: ScenarioAnswerRecord[];
  dailyMission: {
    missionId: DailyMissionType;
    date: string;
    progress: number;
    completed: boolean;
  };
  todayStats: {
    date: string;
    scenariosCompleted: number;
    correctAnswers: number;
    activityLogged: boolean;
  };
  weakAreas: Record<string, { correct: number; total: number }>;
  grokMissions: GrokMission[];
  pendingPromotionCommentary: MilitaryRankId | null;
  onboarding: OnboardingState;
  weeklyChallenge: WeeklyChallengeState;
  earnedBadges: string[];
  squadId: string | null;
  cloudSyncedAt: string | null;
};

export const SCORE_AWARDS = {
  correctAnswer: 80,
  incorrectAnswer: 12,
  streakBonusPerStep: 12,
  maxStreakBonus: 60,
  dailyMission: 50,
  dailyActivity: 8,
} as const;

export function getTodayDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createInitialProgressionState(): ProgressionState {
  const today = getTodayDateString();
  return {
    defenderScore: 0,
    dailyStreak: 0,
    longestStreak: 0,
    correctStreak: 0,
    lastActivityDate: null,
    lastRankId: "private",
    scenarioHistory: [],
    dailyMission: {
      missionId: pickDailyMissionId(today),
      date: today,
      progress: 0,
      completed: false,
    },
    todayStats: {
      date: today,
      scenariosCompleted: 0,
      correctAnswers: 0,
      activityLogged: false,
    },
    weakAreas: {},
    grokMissions: [],
    pendingPromotionCommentary: null,
    onboarding: createInitialOnboardingState(),
    weeklyChallenge: createInitialWeeklyChallengeState(),
    earnedBadges: [],
    squadId: null,
    cloudSyncedAt: null,
  };
}

function pickDailyMissionId(dateString: string): DailyMissionType {
  const dayIndex = new Date(`${dateString}T12:00:00`).getDate();
  return DAILY_MISSION_TEMPLATES[dayIndex % DAILY_MISSION_TEMPLATES.length].id;
}

export function getRankForScore(score: number): MilitaryRank {
  let rank = MILITARY_RANKS[0];
  for (const candidate of MILITARY_RANKS) {
    if (score >= candidate.minScore) {
      rank = candidate;
    }
  }
  return rank;
}

export function getNextRank(currentRank: MilitaryRank): MilitaryRank | null {
  const index = MILITARY_RANKS.findIndex((rank) => rank.id === currentRank.id);
  if (index < 0 || index >= MILITARY_RANKS.length - 1) return null;
  return MILITARY_RANKS[index + 1];
}

export function getRankProgress(
  score: number,
  currentRank: MilitaryRank,
  nextRank: MilitaryRank | null
): { progress: number; pointsToNext: number; isMaxRank: boolean } {
  if (!nextRank) {
    return { progress: 100, pointsToNext: 0, isMaxRank: true };
  }

  const range = nextRank.minScore - currentRank.minScore;
  const earned = score - currentRank.minScore;
  const progress = Math.min(100, Math.round((earned / range) * 100));
  const pointsToNext = Math.max(0, nextRank.minScore - score);

  return { progress, pointsToNext, isMaxRank: false };
}

export function getDailyMissionTemplate(
  missionId: DailyMissionType
): DailyMissionTemplate {
  return (
    DAILY_MISSION_TEMPLATES.find((mission) => mission.id === missionId) ??
    DAILY_MISSION_TEMPLATES[0]
  );
}

function refreshDayState(state: ProgressionState): ProgressionState {
  const today = getTodayDateString();

  if (state.todayStats.date === today && state.dailyMission.date === today) {
    return state;
  }

  const missionId = pickDailyMissionId(today);
  return {
    ...state,
    dailyMission: {
      missionId,
      date: today,
      progress: 0,
      completed: false,
    },
    todayStats: {
      date: today,
      scenariosCompleted: 0,
      correctAnswers: 0,
      activityLogged: false,
    },
  };
}

function updateDailyStreak(
  state: ProgressionState,
  today: string
): Pick<ProgressionState, "dailyStreak" | "longestStreak" | "lastActivityDate"> {
  if (state.lastActivityDate === today) {
    return {
      dailyStreak: state.dailyStreak,
      longestStreak: state.longestStreak,
      lastActivityDate: state.lastActivityDate,
    };
  }

  const yesterday = new Date(`${today}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = getTodayDateString(yesterday);

  const continued = state.lastActivityDate === yesterdayString;
  const dailyStreak = continued ? state.dailyStreak + 1 : 1;
  const longestStreak = Math.max(state.longestStreak, dailyStreak);

  return {
    dailyStreak,
    longestStreak,
    lastActivityDate: today,
  };
}

function computeMissionProgress(
  missionId: DailyMissionType,
  todayStats: ProgressionState["todayStats"],
  dailyStreak: number
): number {
  switch (missionId) {
    case "complete_scenario":
      return todayStats.scenariosCompleted;
    case "correct_answers":
      return todayStats.correctAnswers;
    case "defend_streak":
      return dailyStreak > 0 ? 1 : 0;
    case "hub_training":
      return todayStats.activityLogged ? 1 : 0;
    default:
      return 0;
  }
}

function applyScore(
  state: ProgressionState,
  points: number
): { state: ProgressionState; promoted: boolean; newRank: MilitaryRank } {
  const previousRank = getRankForScore(state.defenderScore);
  const defenderScore = state.defenderScore + points;
  const newRank = getRankForScore(defenderScore);
  const promoted = newRank.id !== previousRank.id;

  return {
    state: {
      ...state,
      defenderScore,
      lastRankId: newRank.id,
      pendingPromotionCommentary: promoted
        ? newRank.id
        : state.pendingPromotionCommentary,
    },
    promoted,
    newRank,
  };
}

export function recordHubActivity(state: ProgressionState): ProgressionState {
  let next = refreshDayState(state);
  const today = getTodayDateString();
  const streakUpdate = updateDailyStreak(next, today);

  const wasAlreadyActive = next.todayStats.activityLogged;

  const template = getDailyMissionTemplate(next.dailyMission.missionId);
  const progress = computeMissionProgress(
    next.dailyMission.missionId,
    next.todayStats,
    next.dailyStreak
  );

  if (
    wasAlreadyActive &&
    next.dailyMission.progress === progress &&
    next.dailyMission.completed ===
      (next.dailyMission.completed || progress >= template.target)
  ) {
    return next;
  }

  next = {
    ...next,
    ...streakUpdate,
    todayStats: {
      ...next.todayStats,
      activityLogged: true,
    },
  };

  if (!wasAlreadyActive) {
    const scored = applyScore(next, SCORE_AWARDS.dailyActivity);
    next = scored.state;
  }

  const updatedProgress = computeMissionProgress(
    next.dailyMission.missionId,
    next.todayStats,
    next.dailyStreak
  );

  if (!next.dailyMission.completed && updatedProgress >= template.target) {
    const scored = applyScore(next, template.reward);
    next = {
      ...scored.state,
      dailyMission: {
        ...next.dailyMission,
        progress: updatedProgress,
        completed: true,
      },
    };
  } else {
    next = {
      ...next,
      dailyMission: {
        ...next.dailyMission,
        progress: updatedProgress,
      },
    };
  }

  return next;
}

export function recordScenarioAnswer(
  state: ProgressionState,
  record: {
    scenarioId: string;
    amendment: string;
    correct: boolean;
  }
): {
  state: ProgressionState;
  pointsEarned: number;
  promoted: boolean;
  newRank: MilitaryRank;
  streakBroken: boolean;
} {
  let next = refreshDayState(state);
  const today = getTodayDateString();
  const streakUpdate = updateDailyStreak(next, today);

  const correctStreak = record.correct ? next.correctStreak + 1 : 0;
  const streakBroken = !record.correct && next.correctStreak > 0;

  let pointsEarned = record.correct
    ? SCORE_AWARDS.correctAnswer
    : SCORE_AWARDS.incorrectAnswer;

  if (record.correct && correctStreak > 1) {
    const bonus = Math.min(
      SCORE_AWARDS.maxStreakBonus,
      (correctStreak - 1) * SCORE_AWARDS.streakBonusPerStep
    );
    pointsEarned += bonus;
  }

  const weakArea = next.weakAreas[record.amendment] ?? {
    correct: 0,
    total: 0,
  };

  next = {
    ...next,
    ...streakUpdate,
    correctStreak,
    scenarioHistory: [
      ...next.scenarioHistory,
      {
        scenarioId: record.scenarioId,
        amendment: record.amendment,
        correct: record.correct,
        answeredAt: new Date().toISOString(),
      },
    ],
    weakAreas: {
      ...next.weakAreas,
      [record.amendment]: {
        correct: weakArea.correct + (record.correct ? 1 : 0),
        total: weakArea.total + 1,
      },
    },
    todayStats: {
      ...next.todayStats,
      scenariosCompleted: next.todayStats.scenariosCompleted + 1,
      correctAnswers:
        next.todayStats.correctAnswers + (record.correct ? 1 : 0),
      activityLogged: true,
    },
  };

  const scored = applyScore(next, pointsEarned);
  next = scored.state;

  const template = getDailyMissionTemplate(next.dailyMission.missionId);
  const progress = computeMissionProgress(
    next.dailyMission.missionId,
    next.todayStats,
    next.dailyStreak
  );

  if (!next.dailyMission.completed && progress >= template.target) {
    const missionScored = applyScore(next, template.reward);
    pointsEarned += template.reward;
    next = {
      ...missionScored.state,
      dailyMission: {
        ...next.dailyMission,
        progress,
        completed: true,
      },
    };
  } else {
    next = {
      ...next,
      dailyMission: {
        ...next.dailyMission,
        progress,
      },
    };
  }

  next = {
    ...next,
    earnedBadges: getEarnedBadges(next),
  };

  return {
    state: next,
    pointsEarned,
    promoted: scored.promoted,
    newRank: scored.newRank,
    streakBroken,
  };
}

export function clearPromotionCommentary(
  state: ProgressionState
): ProgressionState {
  return { ...state, pendingPromotionCommentary: null };
}

export function addGrokMission(
  state: ProgressionState,
  mission: Omit<GrokMission, "id" | "createdAt" | "completed">
): ProgressionState {
  const entry: GrokMission = {
    ...mission,
    id: `grok-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completed: false,
  };

  return {
    ...state,
    grokMissions: [entry, ...state.grokMissions].slice(0, 10),
  };
}

export function completeGrokMission(
  state: ProgressionState,
  missionId: string,
  correct: boolean
): { state: ProgressionState; pointsEarned: number } {
  const mission = state.grokMissions.find((item) => item.id === missionId);
  if (!mission || mission.completed) {
    return { state, pointsEarned: 0 };
  }

  const pointsEarned = correct ? 125 : 25;
  const scored = applyScore(state, pointsEarned);

  return {
    state: {
      ...scored.state,
      grokMissions: scored.state.grokMissions.map((item) =>
        item.id === missionId ? { ...item, completed: true } : item
      ),
    },
    pointsEarned,
  };
}

export function getWeakAreas(
  weakAreas: ProgressionState["weakAreas"]
): { amendment: string; accuracy: number; total: number }[] {
  return Object.entries(weakAreas)
    .map(([amendment, stats]) => ({
      amendment,
      accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      total: stats.total,
    }))
    .filter((area) => area.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function completeOnboardingPath(
  state: ProgressionState,
  goal: OnboardingGoal
): ProgressionState {
  return {
    ...state,
    onboarding: {
      completed: true,
      goal,
      completedAt: new Date().toISOString(),
    },
  };
}

export function recordWeeklyChallengeSession(
  state: ProgressionState,
  sessionScore: number
): ProgressionState {
  return {
    ...state,
    weeklyChallenge: recordWeeklyParticipation(
      refreshWeeklyChallengeState(state.weeklyChallenge),
      sessionScore
    ),
  };
}

export function setSquadMembership(
  state: ProgressionState,
  squadId: string | null
): ProgressionState {
  return { ...state, squadId };
}

export function mergeCloudProgressionState(
  local: ProgressionState,
  remote: Partial<ProgressionState>
): ProgressionState {
  const remoteScore = remote.defenderScore ?? 0;
  const merged: ProgressionState = {
    ...local,
    ...remote,
    defenderScore: Math.max(local.defenderScore, remoteScore),
    weakAreas: { ...local.weakAreas, ...remote.weakAreas },
    earnedBadges: [
      ...new Set([...(local.earnedBadges ?? []), ...(remote.earnedBadges ?? [])]),
    ],
    cloudSyncedAt: new Date().toISOString(),
  };
  return merged;
}

export function buildPerformanceSummary(state: ProgressionState): string {
  const rank = getRankForScore(state.defenderScore);
  const weak = getWeakAreas(state.weakAreas);
  const recent = state.scenarioHistory.slice(-6);

  const weakSummary =
    weak.length > 0
      ? weak
          .slice(0, 3)
          .map(
            (area) =>
              `${area.amendment} (${Math.round(area.accuracy * 100)}% accuracy)`
          )
          .join(", ")
      : "No weak areas identified yet";

  const recentSummary = recent
    .map(
      (answer) =>
        `${answer.amendment}: ${answer.correct ? "correct" : "incorrect"}`
    )
    .join("; ");

  return [
    `Defender Score: ${state.defenderScore}`,
    `Rank: ${rank.title} (${rank.abbreviation})`,
    `Daily streak: ${state.dailyStreak} days`,
    `Correct answer streak: ${state.correctStreak}`,
    `Weak areas: ${weakSummary}`,
    `Recent performance: ${recentSummary || "No scenarios completed yet"}`,
  ].join("\n");
}