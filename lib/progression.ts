import {
  calculateMissionBonus,
  getAdaptiveMissionHistory,
  resolveMajorTopicId,
  type AdaptiveMissionHistory,
  type AdaptiveMissionScenario,
  type AdaptiveMissionSession,
  type TopicPerformanceStats,
} from "@/lib/adaptive-intelligence";
import {
  createInitialOnboardingState,
  type OnboardingGoal,
  type OnboardingState,
} from "@/lib/onboarding-path";
import {
  checkAndAwardCertifications,
  mergeCertifications,
  type CertificationId,
  type CertificationRecord,
} from "@/lib/certifications";
import { getEarnedBadges } from "@/lib/mastery-tracks";
import {
  SCRIBE_OF_LIBERTY_BONUS,
  SCRIBE_OF_LIBERTY_THRESHOLD,
} from "@/lib/saved-lines";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";
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

export type RepublicSimulatorHistoryRecord = {
  scenarioId: string;
  roleId: string;
  fidelityScore: number;
  pointsEarned: number;
  completedAt: string;
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
  topicPerformance: Record<string, TopicPerformanceStats>;
  adaptiveMission: AdaptiveMissionSession | null;
  adaptiveMissionHistory: AdaptiveMissionHistory;
  grokMissions: GrokMission[];
  pendingPromotionCommentary: MilitaryRankId | null;
  onboarding: OnboardingState;
  weeklyChallenge: WeeklyChallengeState;
  earnedBadges: string[];
  certifications?: CertificationRecord[];
  squadId: string | null;
  cloudSyncedAt: string | null;
  republicSimulatorHistory?: RepublicSimulatorHistoryRecord[];
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
    topicPerformance: {},
    adaptiveMission: null,
    adaptiveMissionHistory: {
      date: today,
      missionsGenerated: 0,
    },
    grokMissions: [],
    pendingPromotionCommentary: null,
    onboarding: createInitialOnboardingState(),
    weeklyChallenge: createInitialWeeklyChallengeState(),
    earnedBadges: [],
    certifications: [],
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

export type ScenarioAnswerOptions = {
  correctPoints?: number;
  incorrectPoints?: number;
};

export function recordScenarioAnswer(
  state: ProgressionState,
  record: {
    scenarioId: string;
    amendment: string;
    correct: boolean;
  },
  options?: ScenarioAnswerOptions
): {
  state: ProgressionState;
  pointsEarned: number;
  promoted: boolean;
  newRank: MilitaryRank;
  streakBroken: boolean;
  newCertifications: CertificationId[];
  certificationBonus: number;
} {
  let next = refreshDayState(state);
  const today = getTodayDateString();
  const streakUpdate = updateDailyStreak(next, today);

  const correctStreak = record.correct ? next.correctStreak + 1 : 0;
  const streakBroken = !record.correct && next.correctStreak > 0;

  let pointsEarned = record.correct
    ? (options?.correctPoints ?? SCORE_AWARDS.correctAnswer)
    : (options?.incorrectPoints ?? SCORE_AWARDS.incorrectAnswer);

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

  const topicId = resolveMajorTopicId(record.amendment);
  const topicStats = topicId
    ? (next.topicPerformance?.[topicId] ?? { correct: 0, total: 0 })
    : null;

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
    topicPerformance: topicId
      ? {
          ...(next.topicPerformance ?? {}),
          [topicId]: {
            correct: topicStats!.correct + (record.correct ? 1 : 0),
            total: topicStats!.total + 1,
          },
        }
      : (next.topicPerformance ?? {}),
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

  const certResult = checkAndAwardCertifications(next);
  next = certResult.state;
  pointsEarned += certResult.bonusPoints;

  const startingRank = getRankForScore(state.defenderScore);
  const finalRank = getRankForScore(next.defenderScore);

  return {
    state: next,
    pointsEarned,
    promoted: finalRank.id !== startingRank.id,
    newRank: finalRank,
    streakBroken,
    newCertifications: certResult.newlyAwarded,
    certificationBonus: certResult.bonusPoints,
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
): {
  state: ProgressionState;
  pointsEarned: number;
  newCertifications: CertificationId[];
  certificationBonus: number;
} {
  const mission = state.grokMissions.find((item) => item.id === missionId);
  if (!mission || mission.completed) {
    return {
      state,
      pointsEarned: 0,
      newCertifications: [],
      certificationBonus: 0,
    };
  }

  const result = recordScenarioAnswer(
    state,
    {
      scenarioId: missionId,
      amendment: mission.focusArea,
      correct,
    },
    { correctPoints: 125, incorrectPoints: 25 }
  );

  return {
    state: {
      ...result.state,
      grokMissions: result.state.grokMissions.map((item) =>
        item.id === missionId ? { ...item, completed: true } : item
      ),
    },
    pointsEarned: result.pointsEarned,
    newCertifications: result.newCertifications,
    certificationBonus: result.certificationBonus,
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

function mergeTopicPerformance(
  local: Record<string, TopicPerformanceStats>,
  remote: Record<string, TopicPerformanceStats> | undefined
): Record<string, TopicPerformanceStats> {
  const merged = { ...local };
  if (!remote) return merged;

  for (const [topicId, stats] of Object.entries(remote)) {
    const existing = merged[topicId] ?? { correct: 0, total: 0 };
    merged[topicId] = {
      correct: Math.max(existing.correct, stats.correct),
      total: Math.max(existing.total, stats.total),
    };
  }

  return merged;
}

export function startAdaptiveMission(
  state: ProgressionState,
  mission: {
    title: string;
    focusAreas: string[];
    scenarios: Omit<
      AdaptiveMissionScenario,
      "answered" | "selectedChoiceId" | "correct"
    >[];
    difficulty: ScenarioDifficulty;
    isPremium: boolean;
  }
): ProgressionState {
  const today = getTodayDateString();
  const history = getAdaptiveMissionHistory(state);

  const session: AdaptiveMissionSession = {
    id: `adaptive-mission-${Date.now()}`,
    title: mission.title,
    focusAreas: mission.focusAreas,
    scenarios: mission.scenarios.map((scenario, index) => ({
      ...scenario,
      id: scenario.id || `adaptive-scenario-${index}-${Date.now()}`,
      answered: false,
      selectedChoiceId: null,
      correct: null,
    })),
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    bonusAwarded: null,
    debrief: null,
    difficulty: mission.difficulty,
    isPremium: mission.isPremium,
  };

  return {
    ...state,
    adaptiveMission: session,
    adaptiveMissionHistory: {
      date: today,
      missionsGenerated: history.missionsGenerated + 1,
    },
  };
}

export function answerAdaptiveMissionScenario(
  state: ProgressionState,
  scenarioId: string,
  choiceId: string
): {
  state: ProgressionState;
  correct: boolean;
  pointsEarned: number;
  missionComplete: boolean;
} {
  const mission = state.adaptiveMission;
  if (!mission || mission.completedAt) {
    return { state, correct: false, pointsEarned: 0, missionComplete: false };
  }

  const scenarioIndex = mission.scenarios.findIndex(
    (item) => item.id === scenarioId
  );
  if (scenarioIndex < 0 || mission.scenarios[scenarioIndex].answered) {
    return { state, correct: false, pointsEarned: 0, missionComplete: false };
  }

  const scenario = mission.scenarios[scenarioIndex];
  const correct = choiceId === scenario.correctChoiceId;
  const pointsEarned = correct ? SCORE_AWARDS.correctAnswer : SCORE_AWARDS.incorrectAnswer;

  const updatedScenarios = mission.scenarios.map((item, index) =>
    index === scenarioIndex
      ? {
          ...item,
          answered: true,
          selectedChoiceId: choiceId,
          correct,
        }
      : item
  );

  const topicId = resolveMajorTopicId(scenario.focusArea) ?? scenario.topicId;
  const topicStats = state.topicPerformance?.[topicId] ?? {
    correct: 0,
    total: 0,
  };
  const weakArea = state.weakAreas[scenario.focusArea] ?? {
    correct: 0,
    total: 0,
  };

  let next: ProgressionState = {
    ...state,
    adaptiveMission: {
      ...mission,
      scenarios: updatedScenarios,
      currentIndex: Math.min(scenarioIndex + 1, updatedScenarios.length - 1),
    },
    weakAreas: {
      ...state.weakAreas,
      [scenario.focusArea]: {
        correct: weakArea.correct + (correct ? 1 : 0),
        total: weakArea.total + 1,
      },
    },
    topicPerformance: {
      ...(state.topicPerformance ?? {}),
      [topicId]: {
        correct: topicStats.correct + (correct ? 1 : 0),
        total: topicStats.total + 1,
      },
    },
    scenarioHistory: [
      ...state.scenarioHistory,
      {
        scenarioId: scenario.id,
        amendment: scenario.focusArea,
        correct,
        answeredAt: new Date().toISOString(),
      },
    ],
    todayStats: {
      ...state.todayStats,
      scenariosCompleted: state.todayStats.scenariosCompleted + 1,
      correctAnswers: state.todayStats.correctAnswers + (correct ? 1 : 0),
      activityLogged: true,
    },
  };

  const scored = applyScore(next, pointsEarned);
  next = {
    ...scored.state,
    earnedBadges: getEarnedBadges(scored.state),
  };

  const certResult = checkAndAwardCertifications(next);
  next = certResult.state;

  const allAnswered = updatedScenarios.every((item) => item.answered);

  return {
    state: next,
    correct,
    pointsEarned: pointsEarned + certResult.bonusPoints,
    missionComplete: allAnswered,
  };
}

export function finalizeAdaptiveMission(
  state: ProgressionState,
  debrief: string
): { state: ProgressionState; bonusAwarded: number; promoted: boolean; newRank: MilitaryRank } {
  const mission = state.adaptiveMission;
  if (!mission) {
    return {
      state,
      bonusAwarded: 0,
      promoted: false,
      newRank: getRankForScore(state.defenderScore),
    };
  }

  const correctCount = mission.scenarios.filter((item) => item.correct).length;
  const bonusAwarded = calculateMissionBonus(
    correctCount,
    mission.scenarios.length,
    mission.focusAreas.length
  );

  const scored = applyScore(state, bonusAwarded);
  const completedMission: AdaptiveMissionSession = {
    ...mission,
    completedAt: new Date().toISOString(),
    bonusAwarded,
    debrief,
  };

  let finalState: ProgressionState = {
    ...scored.state,
    adaptiveMission: completedMission,
    earnedBadges: getEarnedBadges(scored.state),
  };

  const certResult = checkAndAwardCertifications(finalState);
  finalState = certResult.state;

  const startingRank = getRankForScore(state.defenderScore);
  const finalRank = getRankForScore(finalState.defenderScore);

  return {
    state: finalState,
    bonusAwarded: bonusAwarded + certResult.bonusPoints,
    promoted: finalRank.id !== startingRank.id,
    newRank: finalRank,
  };
}

export function clearAdaptiveMission(state: ProgressionState): ProgressionState {
  return { ...state, adaptiveMission: null };
}

function mergeWeakAreas(
  local: ProgressionState["weakAreas"],
  remote: ProgressionState["weakAreas"] | undefined
): ProgressionState["weakAreas"] {
  const merged = { ...local };
  if (!remote) return merged;

  for (const [label, stats] of Object.entries(remote)) {
    const existing = merged[label] ?? { correct: 0, total: 0 };
    merged[label] = {
      correct: Math.max(existing.correct, stats.correct),
      total: Math.max(existing.total, stats.total),
    };
  }

  return merged;
}

export function mergeCloudProgressionState(
  local: ProgressionState,
  remote: Partial<ProgressionState>
): ProgressionState {
  const remoteScore = remote.defenderScore ?? 0;
  const remoteHistory = remote.scenarioHistory ?? [];
  const mergedHistory = [...local.scenarioHistory, ...remoteHistory]
    .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt))
    .slice(-100);

  const grokMissionMap = new Map(
    [...(remote.grokMissions ?? []), ...local.grokMissions].map((mission) => [
      mission.id,
      mission,
    ])
  );

  const merged: ProgressionState = {
    ...local,
    ...remote,
    defenderScore: Math.max(local.defenderScore, remoteScore),
    weakAreas: mergeWeakAreas(local.weakAreas, remote.weakAreas),
    topicPerformance: mergeTopicPerformance(
      local.topicPerformance ?? {},
      remote.topicPerformance
    ),
    scenarioHistory: mergedHistory,
    grokMissions: [...grokMissionMap.values()].slice(0, 10),
    adaptiveMission: local.adaptiveMission ?? remote.adaptiveMission ?? null,
    adaptiveMissionHistory:
      local.adaptiveMissionHistory?.missionsGenerated >=
      (remote.adaptiveMissionHistory?.missionsGenerated ?? 0)
        ? local.adaptiveMissionHistory
        : (remote.adaptiveMissionHistory ?? local.adaptiveMissionHistory),
    earnedBadges: [
      ...new Set([...(local.earnedBadges ?? []), ...(remote.earnedBadges ?? [])]),
    ],
    certifications: mergeCertifications(
      local.certifications,
      remote.certifications
    ),
    republicSimulatorHistory: [
      ...(remote.republicSimulatorHistory ?? []),
      ...(local.republicSimulatorHistory ?? []),
    ]
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
      .slice(-20),
    cloudSyncedAt: new Date().toISOString(),
  };
  return merged;
}

export function recordRepublicSimulatorCompletion(
  state: ProgressionState,
  record: {
    scenarioId: string;
    roleId: string;
    fidelityScore: number;
    pointsEarned: number;
  }
): {
  state: ProgressionState;
  pointsEarned: number;
  promoted: boolean;
  newRank: MilitaryRank;
} {
  let next = refreshDayState(state);
  const today = getTodayDateString();
  const streakUpdate = updateDailyStreak(next, today);

  const scored = applyScore(next, record.pointsEarned);
  next = {
    ...scored.state,
    ...streakUpdate,
    todayStats: {
      ...next.todayStats,
      activityLogged: true,
      scenariosCompleted: next.todayStats.scenariosCompleted + 1,
    },
    republicSimulatorHistory: [
      ...(next.republicSimulatorHistory ?? []),
      {
        scenarioId: record.scenarioId,
        roleId: record.roleId,
        fidelityScore: record.fidelityScore,
        pointsEarned: record.pointsEarned,
        completedAt: new Date().toISOString(),
      },
    ].slice(-20),
  };

  return {
    state: next,
    pointsEarned: record.pointsEarned,
    promoted: scored.promoted,
    newRank: scored.newRank,
  };
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

export function awardScribeOfLibertyIfEligible(
  state: ProgressionState,
  savedLinesCount: number
): { state: ProgressionState; awarded: boolean } {
  if (savedLinesCount < SCRIBE_OF_LIBERTY_THRESHOLD) {
    return { state, awarded: false };
  }

  if (state.earnedBadges.includes("scribe-of-liberty")) {
    return { state, awarded: false };
  }

  const previousRank = getRankForScore(state.defenderScore);
  const defenderScore = state.defenderScore + SCRIBE_OF_LIBERTY_BONUS;
  const newRank = getRankForScore(defenderScore);
  const promoted = newRank.id !== previousRank.id;

  return {
    state: {
      ...state,
      defenderScore,
      lastRankId: newRank.id,
      earnedBadges: [...state.earnedBadges, "scribe-of-liberty"],
      pendingPromotionCommentary: promoted
        ? newRank.id
        : state.pendingPromotionCommentary,
    },
    awarded: true,
  };
}