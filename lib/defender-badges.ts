import type { DocumentSlug } from "@/lib/document-links";
import { FOUNDING_DOCUMENTS } from "@/lib/documents";
import {
  getRankForScore,
  MILITARY_RANKS,
  type MilitaryRankId,
} from "@/lib/progression";

export const DEFENDER_BADGE_STYLE_BLOCK = `Circular military challenge-coin badge design. Flag-blue (#3b5998) and parchment/cream (#f5e6c8) color palette. Raised metallic gold (#c9a227) rim border. Central tricorn hat and shield motif in the No Face Patriot civic defense aesthetic — serious, patriotic, non-partisan, founding-era military tone. Deep navy (#0a0f1c) accents. Clean engraved typography layout. Subtle parchment texture background. Professional commemorative coin quality, not cartoonish. No human face — masked guardian silhouette only. Small watermark text along the bottom inner rim reading "The Line" and "the-line-eight.vercel.app".`;

export type DefenderBadgeType = "document" | "rank";

export type DefenderBadgeAchievementId =
  | `document:${DocumentSlug}`
  | `rank:${MilitaryRankId}`;

export type DefenderBadgeRecord = {
  id: DefenderBadgeAchievementId;
  type: DefenderBadgeType;
  imageUrl: string;
  blobPath: string;
  displayName: string;
  rankTitle: string;
  rankNumber: number;
  defenderScore: number;
  milestoneLabel: string;
  earnedAt: string;
  generatedAt: string;
};

export function getRankNumber(rankId: MilitaryRankId): number {
  const index = MILITARY_RANKS.findIndex((rank) => rank.id === rankId);
  return index >= 0 ? index + 1 : 1;
}

export function getDocumentBadgeAchievementId(
  slug: DocumentSlug
): DefenderBadgeAchievementId {
  return `document:${slug}`;
}

export function getRankBadgeAchievementId(
  rankId: MilitaryRankId
): DefenderBadgeAchievementId {
  return `rank:${rankId}`;
}

export function getDocumentTitle(slug: DocumentSlug): string {
  return (
    FOUNDING_DOCUMENTS.find((doc) => doc.slug === slug)?.title ?? slug
  );
}

export function getMilestoneLabel(achievementId: DefenderBadgeAchievementId): string {
  if (achievementId.startsWith("document:")) {
    const slug = achievementId.replace("document:", "") as DocumentSlug;
    return `Completed all passages — ${getDocumentTitle(slug)}`;
  }

  const rankId = achievementId.replace("rank:", "") as MilitaryRankId;
  const rank = MILITARY_RANKS.find((entry) => entry.id === rankId);
  return rank ? `Promoted to ${rank.title}` : "Rank advancement";
}

export function buildDefenderBadgePrompt(options: {
  displayName: string;
  rankTitle: string;
  rankNumber: number;
  defenderScore: number;
  milestoneLabel: string;
  dateLabel: string;
}): string {
  return `${DEFENDER_BADGE_STYLE_BLOCK}

VARIABLE DETAILS FOR THIS SPECIFIC BADGE:
- Defender callsign: ${options.displayName}
- Rank: ${options.rankTitle} (Rank #${options.rankNumber})
- Defender Score: ${options.defenderScore.toLocaleString()}
- Achievement: ${options.milestoneLabel}
- Date earned: ${options.dateLabel}

Layout the variable text engraved around the coin face in a balanced challenge-coin composition.`;
}

export function parseBadgeAchievementId(
  value: string
): DefenderBadgeAchievementId | null {
  if (value.startsWith("document:")) {
    const slug = value.replace("document:", "");
    if (slug === "declaration" || slug === "constitution" || slug === "bill-of-rights") {
      return value as DefenderBadgeAchievementId;
    }
    return null;
  }

  if (value.startsWith("rank:")) {
    const rankId = value.replace("rank:", "") as MilitaryRankId;
    if (MILITARY_RANKS.some((rank) => rank.id === rankId)) {
      return value as DefenderBadgeAchievementId;
    }
  }

  return null;
}

export function validateRankBadgeEligibility(
  defenderScore: number,
  achievementId: DefenderBadgeAchievementId
): boolean {
  if (!achievementId.startsWith("rank:")) return false;
  const rankId = achievementId.replace("rank:", "") as MilitaryRankId;
  if (rankId === "private") return false;
  const rank = MILITARY_RANKS.find((entry) => entry.id === rankId);
  return rank ? defenderScore >= rank.minScore : false;
}

export function formatBadgeDateLabel(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getBadgeRankContext(defenderScore: number) {
  const rank = getRankForScore(defenderScore);
  return {
    rankTitle: rank.title,
    rankNumber: getRankNumber(rank.id),
  };
}