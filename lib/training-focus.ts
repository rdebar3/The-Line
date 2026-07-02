import type { ProgressionState } from "@/lib/progression";

export const TOPIC_MASTERY_TARGET = 5;

export type TopicDifficultyLevel = "foundational" | "intermediate" | "advanced";

export type TopicStats = {
  correct: number;
  total: number;
  accuracy: number;
};

export type MasteryCategory = {
  id: string;
  label: string;
  correct: number;
  total: number;
  accuracy: number;
};

const MASTERY_GROUPS: {
  id: string;
  label: string;
  match: (amendmentLabel: string) => boolean;
}[] = [
  {
    id: "bill-of-rights",
    label: "Bill of Rights",
    match: (label) =>
      /^\d|Amendment|First |Fourth |Fifth |Sixth |Eighth /i.test(label) ||
      label.includes("Bill of Rights"),
  },
  {
    id: "declaration",
    label: "Declaration",
    match: (label) => label.startsWith("Declaration"),
  },
  {
    id: "constitution",
    label: "Constitution",
    match: (label) =>
      label.startsWith("Constitution") ||
      label.startsWith("Article") ||
      label.startsWith("Art."),
  },
  {
    id: "principles",
    label: "Core Principles",
    match: (label) =>
      label.includes("Separation") ||
      label.includes("Federalism") ||
      label.includes("Principle") ||
      label.includes("Preamble") ||
      label.includes("Commerce") ||
      label.includes("Checks"),
  },
];

export const TOPIC_DIFFICULTY_LABELS: Record<
  TopicDifficultyLevel,
  { label: string; className: string }
> = {
  foundational: {
    label: "Foundational",
    className: "border-gold/30 bg-gold/10 text-gold",
  },
  intermediate: {
    label: "Intermediate",
    className: "border-crimson/30 bg-crimson/10 text-crimson",
  },
  advanced: {
    label: "Advanced",
    className:
      "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
  },
};

export function getTopicStats(
  state: ProgressionState | null | undefined,
  amendmentLabel: string
): TopicStats {
  if (!state || !amendmentLabel) {
    return { correct: 0, total: 0, accuracy: 0 };
  }

  const stats = state.weakAreas[amendmentLabel] ?? { correct: 0, total: 0 };
  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return { correct: stats.correct, total: stats.total, accuracy };
}

export function getTopicDifficultyLevel(
  stats: TopicStats
): TopicDifficultyLevel {
  if (stats.total < 3) return "foundational";
  if (stats.accuracy >= 80) return "advanced";
  if (stats.accuracy >= 60) return "intermediate";
  return "foundational";
}

export function getFocusProgress(stats: TopicStats): {
  completed: number;
  target: number;
} {
  return {
    completed: Math.min(stats.total, TOPIC_MASTERY_TARGET),
    target: TOPIC_MASTERY_TARGET,
  };
}

export function getSessionFocusProgress(
  sessionScenarios: { amendmentLabel: string; id: string }[],
  answers: { scenarioId: string }[],
  focusLabel: string
): { completed: number; total: number } {
  const focusScenarios = sessionScenarios.filter(
    (scenario) => scenario.amendmentLabel === focusLabel
  );
  const completed = focusScenarios.filter((scenario) =>
    answers.some((answer) => answer.scenarioId === scenario.id)
  ).length;

  return { completed, total: focusScenarios.length };
}

export function getOverallMasteryCategories(
  state: ProgressionState | null | undefined
): MasteryCategory[] {
  if (!state) {
    return MASTERY_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      correct: 0,
      total: 0,
      accuracy: 0,
    }));
  }

  return MASTERY_GROUPS.map((group) => {
    const entries = Object.entries(state.weakAreas).filter(([label]) =>
      group.match(label)
    );

    const total = entries.reduce((sum, [, stats]) => sum + stats.total, 0);
    const correct = entries.reduce((sum, [, stats]) => sum + stats.correct, 0);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      id: group.id,
      label: group.label,
      correct,
      total,
      accuracy,
    };
  });
}