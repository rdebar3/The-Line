import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-guards";
import { generateDefenderBadgeImage } from "@/lib/defender-badge-grok";
import {
  parseBadgeAchievementId,
  validateRankBadgeEligibility,
  type DefenderBadgeAchievementId,
} from "@/lib/defender-badges";
import {
  getDefenderBadge,
  isDefenderBadgeStorageConfigured,
} from "@/lib/defender-badge-storage";
import {
  getViewedPassages,
  isDocumentFullyRead,
} from "@/lib/document-progress";
import { loadCloudProgression } from "@/lib/progression-cloud";
import type { ProgressionState } from "@/lib/progression";

type GenerateRequest = {
  achievementId: string;
  viewedPassages?: ProgressionState["viewedPassages"];
  defenderScore?: number;
};

function resolveProgression(
  remote: Partial<ProgressionState> | null,
  body: GenerateRequest
): { defenderScore: number; viewedPassages: ProgressionState["viewedPassages"] } {
  const remoteScore = remote?.defenderScore ?? 0;
  const bodyScore = body.defenderScore ?? 0;
  const defenderScore = Math.max(remoteScore, bodyScore);

  const remoteViewed = remote?.viewedPassages ?? {};
  const bodyViewed = body.viewedPassages ?? {};
  const viewedPassages: ProgressionState["viewedPassages"] = {
    declaration: [
      ...new Set([
        ...(remoteViewed.declaration ?? []),
        ...(bodyViewed.declaration ?? []),
      ]),
    ],
    constitution: [
      ...new Set([
        ...(remoteViewed.constitution ?? []),
        ...(bodyViewed.constitution ?? []),
      ]),
    ],
    "bill-of-rights": [
      ...new Set([
        ...(remoteViewed["bill-of-rights"] ?? []),
        ...(bodyViewed["bill-of-rights"] ?? []),
      ]),
    ],
  };

  return { defenderScore, viewedPassages };
}

function validateAchievement(
  achievementId: DefenderBadgeAchievementId,
  progression: {
    defenderScore: number;
    viewedPassages: ProgressionState["viewedPassages"];
  }
): string | null {
  if (achievementId.startsWith("document:")) {
    const slug = achievementId.replace("document:", "") as
      | "declaration"
      | "constitution"
      | "bill-of-rights";
    const readIds = progression.viewedPassages?.[slug] ?? [];
    if (!isDocumentFullyRead(slug, readIds)) {
      return "Document completion not verified.";
    }
    return null;
  }

  if (!validateRankBadgeEligibility(progression.defenderScore, achievementId)) {
    return "Rank threshold not met.";
  }

  return null;
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  if (!isDefenderBadgeStorageConfigured()) {
    return NextResponse.json(
      { error: "Badge storage is not configured." },
      { status: 503 }
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const achievementId = parseBadgeAchievementId(body.achievementId);
  if (!achievementId) {
    return NextResponse.json({ error: "Invalid achievement id." }, { status: 400 });
  }

  const existing = await getDefenderBadge(authResult.userId, achievementId);
  if (existing) {
    return NextResponse.json({
      badge: existing,
      cached: true,
      generated: false,
    });
  }

  const remote = await loadCloudProgression(authResult.userId);
  const progression = resolveProgression(remote, body);
  const validationError = validateAchievement(achievementId, progression);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 403 });
  }

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      { error: "Image generation is not configured." },
      { status: 503 }
    );
  }

  try {
    const badge = await generateDefenderBadgeImage({
      userId: authResult.userId,
      achievementId,
      defenderScore: progression.defenderScore,
    });

    return NextResponse.json({
      badge,
      cached: false,
      generated: true,
    });
  } catch (error) {
    console.error("Defender badge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate defender badge." },
      { status: 500 }
    );
  }
}