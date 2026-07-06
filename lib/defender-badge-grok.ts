import {
  buildDefenderBadgePrompt,
  formatBadgeDateLabel,
  getBadgeRankContext,
  getMilestoneLabel,
  type DefenderBadgeAchievementId,
  type DefenderBadgeRecord,
} from "@/lib/defender-badges";
import {
  getUserDisplayName,
  saveDefenderBadge,
  uploadDefenderBadgeImage,
} from "@/lib/defender-badge-storage";

const XAI_IMAGES_URL = "https://api.x.ai/v1/images/generations";
const BADGE_IMAGE_MODEL = "grok-imagine-image-quality";

type ImageGenerationResponse = {
  data?: Array<{ b64_json?: string; url?: string }>;
};

export async function generateDefenderBadgeImage(options: {
  userId: string;
  achievementId: DefenderBadgeAchievementId;
  defenderScore: number;
  earnedAt?: string;
}): Promise<DefenderBadgeRecord> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const displayName = await getUserDisplayName(options.userId);
  const rankContext = getBadgeRankContext(options.defenderScore);
  const earnedAt = options.earnedAt ?? new Date().toISOString();
  const dateLabel = formatBadgeDateLabel(new Date(earnedAt));
  const milestoneLabel = getMilestoneLabel(options.achievementId);

  const prompt = buildDefenderBadgePrompt({
    displayName,
    rankTitle: rankContext.rankTitle,
    rankNumber: rankContext.rankNumber,
    defenderScore: options.defenderScore,
    milestoneLabel,
    dateLabel,
  });

  const response = await fetch(XAI_IMAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: BADGE_IMAGE_MODEL,
      prompt,
      aspect_ratio: "1:1",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Badge image generation failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ImageGenerationResponse;
  const b64 = data.data?.[0]?.b64_json;

  if (!b64) {
    throw new Error("Badge image generation returned no image data.");
  }

  const imageBytes = Buffer.from(b64, "base64");
  const uploaded = await uploadDefenderBadgeImage({
    userId: options.userId,
    achievementId: options.achievementId,
    imageBytes,
  });

  const record: DefenderBadgeRecord = {
    id: options.achievementId,
    type: options.achievementId.startsWith("document:") ? "document" : "rank",
    imageUrl: uploaded.url,
    blobPath: uploaded.pathname,
    displayName,
    rankTitle: rankContext.rankTitle,
    rankNumber: rankContext.rankNumber,
    defenderScore: options.defenderScore,
    milestoneLabel,
    earnedAt,
    generatedAt: new Date().toISOString(),
  };

  await saveDefenderBadge(options.userId, record);
  return record;
}