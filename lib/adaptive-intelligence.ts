import type { ProgressionState } from "@/lib/progression";
import { getRankForScore } from "@/lib/progression";
import {
  getDifficultyForRankObject,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";

export type TopicPerformanceStats = {
  correct: number;
  total: number;
};

export type MajorTopic = {
  id: string;
  label: string;
  description: string;
  matchers: string[];
};

/** Canonical major topics tracked by the Adaptive Intelligence Engine */
export const MAJOR_TOPICS: MajorTopic[] = [
  {
    id: "4th-amendment",
    label: "4th Amendment",
    description: "Search, seizure, and probable cause",
    matchers: ["4th", "fourth amendment", "search", "seizure", "warrant"],
  },
  {
    id: "consent-governed",
    label: "Consent of the Governed",
    description: "Legitimate authority and the right to alter government",
    matchers: [
      "consent of the governed",
      "consent",
      "alter or abolish",
      "just powers",
      "declaration — consent",
    ],
  },
  {
    id: "due-process",
    label: "Due Process",
    description: "Fair procedure, habeas corpus, and incorporation",
    matchers: [
      "due process",
      "5th",
      "14th",
      "fourteenth",
      "habeas",
      "self-incrimination",
      "double jeopardy",
    ],
  },
  {
    id: "free-speech",
    label: "Free Speech",
    description: "Expression, press, assembly, and petition",
    matchers: [
      "1st",
      "first amendment",
      "free speech",
      "freedom of speech",
      "press",
      "assembly",
      "petition",
    ],
  },
  {
    id: "separation-powers",
    label: "Separation of Powers",
    description: "Checks, balances, and limited government structure",
    matchers: [
      "separation of powers",
      "art. i",
      "art. ii",
      "art. iii",
      "article i",
      "article ii",
      "article iii",
      "checks and balances",
      "enumerated powers",
    ],
  },
  {
    id: "natural-rights",
    label: "Natural Rights",
    description: "Self-evident truths and unalienable rights",
    matchers: [
      "natural rights",
      "unalienable",
      "self-evident",
      "declaration — natural",
      "life liberty",
    ],
  },
  {
    id: "federalism",
    label: "Federalism & State Powers",
    description: "Reserved powers and limits on federal authority",
    matchers: [
      "10th",
      "federalism",
      "reserved powers",
      "states' rights",
      "commerce clause",
      "necessary and proper",
    ],
  },
  {
    id: "equal-protection",
    label: "Equal Protection",
    description: "Equal treatment under the law",
    matchers: ["equal protection", "14th", "fourteenth amendment — equal"],
  },
];

export type TopicPerformanceEntry = {
  topicId: string;
  label: string;
  description: string;
  accuracy: number;
  total: number;
  correct: number;
};

export type IntelligenceReport = {
  topics: TopicPerformanceEntry[];
  weakAreas: TopicPerformanceEntry[];
  strongAreas: TopicPerformanceEntry[];
  totalAnswered: number;
  overallAccuracy: number;
  hasEnoughData: boolean;
  recommendedFocus: string[];
  difficulty: ScenarioDifficulty;
};

export type AdaptiveMissionScenario = {
  id: string;
  title: string;
  focusArea: string;
  topicId: string;
  sourceDocument: string;
  scenario: string;
  question: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  difficultyLevel: number;
  answered: boolean;
  selectedChoiceId: string | null;
  correct: boolean | null;
};

export type AdaptiveMissionSession = {
  id: string;
  title: string;
  focusAreas: string[];
  scenarios: AdaptiveMissionScenario[];
  currentIndex: number;
  startedAt: string;
  completedAt: string | null;
  bonusAwarded: number | null;
  debrief: string | null;
  difficulty: ScenarioDifficulty;
  isPremium: boolean;
};

export type AdaptiveMissionHistory = {
  date: string;
  missionsGenerated: number;
};

export const ADAPTIVE_MISSION_LIMITS = {
  freeScenariosPerMission: 3,
  premiumScenariosPerMission: 5,
  freeMissionsPerDay: 1,
  premiumMissionsPerDay: 10,
  minBonusPoints: 20,
  maxBonusPoints: 50,
} as const;

export function resolveMajorTopicId(amendment: string): string | null {
  const normalized = amendment.toLowerCase().trim();
  if (!normalized) return null;

  for (const topic of MAJOR_TOPICS) {
    if (
      topic.matchers.some(
        (matcher) =>
          normalized.includes(matcher) || matcher.includes(normalized)
      )
    ) {
      return topic.id;
    }
  }

  return null;
}

export function getMajorTopicById(topicId: string): MajorTopic | undefined {
  return MAJOR_TOPICS.find((topic) => topic.id === topicId);
}

/** Build topic performance from stored stats + legacy weakAreas amendment keys */
export function buildTopicPerformance(
  state: ProgressionState
): Record<string, TopicPerformanceStats> {
  const merged: Record<string, TopicPerformanceStats> = {
    ...(state.topicPerformance ?? {}),
  };

  for (const [amendment, stats] of Object.entries(state.weakAreas)) {
    const topicId = resolveMajorTopicId(amendment);
    if (!topicId) continue;

    const existing = merged[topicId] ?? { correct: 0, total: 0 };
    merged[topicId] = {
      correct: existing.correct + stats.correct,
      total: existing.total + stats.total,
    };
  }

  return merged;
}

export function getTopicPerformanceEntries(
  state: ProgressionState
): TopicPerformanceEntry[] {
  const performance = buildTopicPerformance(state);

  return MAJOR_TOPICS.map((topic) => {
    const stats = performance[topic.id] ?? { correct: 0, total: 0 };
    const accuracy =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return {
      topicId: topic.id,
      label: topic.label,
      description: topic.description,
      accuracy,
      total: stats.total,
      correct: stats.correct,
    };
  }).filter((entry) => entry.total > 0);
}

export function getIntelligenceReport(state: ProgressionState): IntelligenceReport {
  const rank = getRankForScore(state.defenderScore);
  const difficulty = getDifficultyForRankObject(rank);
  const entries = getTopicPerformanceEntries(state);

  const sorted = [...entries].sort((a, b) => a.accuracy - b.accuracy);
  const weakAreas = sorted.slice(0, 3);
  const strongAreas = [...entries]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 2);

  const totalAnswered = entries.reduce((sum, entry) => sum + entry.total, 0);
  const totalCorrect = entries.reduce((sum, entry) => sum + entry.correct, 0);
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const recommendedFocus =
    weakAreas.length > 0
      ? weakAreas.map((area) => area.label)
      : ["Consent of the Governed", "4th Amendment", "Due Process"];

  return {
    topics: entries,
    weakAreas,
    strongAreas,
    totalAnswered,
    overallAccuracy,
    hasEnoughData: totalAnswered >= 3,
    recommendedFocus,
    difficulty,
  };
}

export function getAdaptiveMissionHistory(
  state: ProgressionState
): AdaptiveMissionHistory {
  const today = new Date().toISOString().slice(0, 10);
  const history = state.adaptiveMissionHistory;

  if (!history || history.date !== today) {
    return { date: today, missionsGenerated: 0 };
  }

  return history;
}

export function canGenerateAdaptiveMission(
  state: ProgressionState,
  isPremium: boolean
): { allowed: boolean; reason: string | null; remaining: number } {
  const history = getAdaptiveMissionHistory(state);
  const limit = isPremium
    ? ADAPTIVE_MISSION_LIMITS.premiumMissionsPerDay
    : ADAPTIVE_MISSION_LIMITS.freeMissionsPerDay;
  const remaining = Math.max(0, limit - history.missionsGenerated);

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: isPremium
        ? "Daily personalized mission limit reached. Return tomorrow."
        : "Free tier includes 1 personalized mission per day. Unlock Full Access for deeper daily missions.",
      remaining: 0,
    };
  }

  if (state.adaptiveMission && !state.adaptiveMission.completedAt) {
    return {
      allowed: false,
      reason: "Complete your active personalized mission first.",
      remaining,
    };
  }

  return { allowed: true, reason: null, remaining };
}

export function getAdaptiveScenarioCount(isPremium: boolean): number {
  return isPremium
    ? ADAPTIVE_MISSION_LIMITS.premiumScenariosPerMission
    : ADAPTIVE_MISSION_LIMITS.freeScenariosPerMission;
}

export function calculateMissionBonus(
  correctCount: number,
  totalCount: number,
  focusAreaCount: number
): number {
  if (totalCount <= 0) return ADAPTIVE_MISSION_LIMITS.minBonusPoints;

  const accuracyRatio = correctCount / totalCount;
  const focusBonus = Math.min(10, focusAreaCount * 3);
  const raw =
    ADAPTIVE_MISSION_LIMITS.minBonusPoints +
    Math.round(accuracyRatio * 25) +
    focusBonus;

  return Math.min(ADAPTIVE_MISSION_LIMITS.maxBonusPoints, raw);
}

export function buildAdaptivePerformanceSummary(
  state: ProgressionState,
  report: IntelligenceReport
): string {
  const base = [
    `Defender Score: ${state.defenderScore}`,
    `Overall topic accuracy: ${report.overallAccuracy}% across ${report.totalAnswered} tracked answers`,
  ];

  if (report.weakAreas.length > 0) {
    base.push(
      `Priority weak areas: ${report.weakAreas
        .map((area) => `${area.label} (${area.accuracy}%)`)
        .join(", ")}`
    );
  } else {
    base.push(
      `No weak areas yet — assign foundational missions across Declaration, Constitution, and Bill of Rights.`
    );
  }

  if (report.strongAreas.length > 0) {
    base.push(
      `Strengths: ${report.strongAreas
        .map((area) => `${area.label} (${area.accuracy}%)`)
        .join(", ")}`
    );
  }

  return base.join("\n");
}