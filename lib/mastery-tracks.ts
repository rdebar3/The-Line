import { CURRICULUM_TOPICS } from "@/lib/scenario-curriculum";
import type { ProgressionState } from "@/lib/progression";

export type MasteryBadgeId =
  | "declaration-starter"
  | "bill-of-rights-starter"
  | "constitution-starter"
  | "sharp-shooter"
  | "line-holder";

export type MasteryTrack = {
  id: string;
  label: string;
  accuracy: number;
  answered: number;
  mastered: boolean;
  badgeId: MasteryBadgeId | null;
};

const TRACK_GROUPS = [
  {
    id: "declaration",
    label: "Declaration",
    match: (label: string) => label.startsWith("Declaration"),
    badgeId: "declaration-starter" as const,
  },
  {
    id: "constitution",
    label: "Constitution",
    match: (label: string) =>
      label.startsWith("Constitution") ||
      label.startsWith("Article") ||
      label.startsWith("Art."),
    badgeId: "constitution-starter" as const,
  },
  {
    id: "bill-of-rights",
    label: "Bill of Rights",
    match: (label: string) => /^\d/.test(label) || label.includes("Amendment"),
    badgeId: "bill-of-rights-starter" as const,
  },
];

export function getMasteryTracks(state: ProgressionState): MasteryTrack[] {
  const topicLabels = new Set(CURRICULUM_TOPICS.map((t) => t.amendmentLabel));

  return TRACK_GROUPS.map((group) => {
    const entries = Object.entries(state.weakAreas).filter(([label]) => {
      if (!topicLabels.has(label) && !group.match(label)) return false;
      return group.match(label) || label.toLowerCase().includes(group.id.replace("-", " "));
    });

    const total = entries.reduce((sum, [, s]) => sum + s.total, 0);
    const correct = entries.reduce((sum, [, s]) => sum + s.correct, 0);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mastered = total >= 5 && accuracy >= 80;

    return {
      id: group.id,
      label: group.label,
      accuracy,
      answered: total,
      mastered,
      badgeId: mastered ? group.badgeId : null,
    };
  });
}

export function getEarnedBadges(state: ProgressionState): MasteryBadgeId[] {
  const badges = new Set<MasteryBadgeId>(
    (state.earnedBadges ?? []) as MasteryBadgeId[]
  );
  for (const track of getMasteryTracks(state)) {
    if (track.badgeId) badges.add(track.badgeId);
  }
  if (state.correctStreak >= 5) badges.add("sharp-shooter");
  if (state.dailyStreak >= 7) badges.add("line-holder");
  return [...badges];
}

export const BADGE_LABELS: Record<MasteryBadgeId, string> = {
  "declaration-starter": "Declaration Ready",
  "bill-of-rights-starter": "Bill of Rights Ready",
  "constitution-starter": "Constitution Ready",
  "sharp-shooter": "5-Answer Streak",
  "line-holder": "7-Day Streak",
};