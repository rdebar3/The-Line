import { NextResponse } from "next/server";

import { requireAuth, requirePremium } from "@/lib/api-guards";
import {
  buildProgressionUserPrompt,
  getProgressionSystemPrompt,
  parseGrokMissionPayload,
  type GrokProgressionRequest,
} from "@/lib/grok-progression";
import { getRankForScore } from "@/lib/progression";
import {
  getDifficultyForRankObject,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";
import {
  callGrokCompletion,
  prepareSharedGeneration,
  recordSharedGenerationOutput,
} from "@/lib/shared-generator";

function resolveDrillDifficulty(
  defenderScore?: number
): ScenarioDifficulty {
  if (typeof defenderScore !== "number" || Number.isNaN(defenderScore)) {
    return "medium";
  }

  return getDifficultyForRankObject(getRankForScore(defenderScore));
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const premiumResult = await requirePremium(authResult.userId);
  if (premiumResult.error) return premiumResult.error;

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Grok progression is not configured. Set XAI_API_KEY to enable personalized training.",
      },
      { status: 503 }
    );
  }

  let body: GrokProgressionRequest & {
    defenderScore?: number;
    weakAreas?: string[];
    sessionSeed?: number;
  };

  try {
    body = (await request.json()) as GrokProgressionRequest & {
      defenderScore?: number;
      weakAreas?: string[];
      sessionSeed?: number;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    !body.action ||
    !body.performanceSummary?.trim() ||
    !["promotion_commentary", "next_mission", "personalized_scenario"].includes(
      body.action
    )
  ) {
    return NextResponse.json(
      { error: "Invalid progression request." },
      { status: 400 }
    );
  }

  let generationRequest: GrokProgressionRequest = body;
  const sessionSeed = body.sessionSeed ?? Date.now();

  if (
    body.action === "next_mission" ||
    body.action === "personalized_scenario"
  ) {
    const difficulty = resolveDrillDifficulty(body.defenderScore);
    const { history, topicAssignment } = await prepareSharedGeneration(
      authResult.userId,
      {
        mode: body.action === "personalized_scenario" ? "weak_area" : "general",
        difficulty,
        weakAreas: body.weakAreas ?? [],
        recentTopicIds: [],
        recentAmendmentTags: [],
        sessionSeed,
        focusArea: body.focusArea,
      }
    );

    generationRequest = {
      ...body,
      topicAssignment,
      generationHistory: history,
    };
  }

  const systemPrompt = getProgressionSystemPrompt(body.action);
  const userPrompt = buildProgressionUserPrompt(generationRequest);

  try {
    const content = await callGrokCompletion({
      systemPrompt,
      userPrompt: userPrompt.slice(0, 4000),
      temperature: body.action === "promotion_commentary" ? 0.5 : 0.35,
      maxTokens: body.action === "promotion_commentary" ? 600 : 1200,
    });

    if (body.action === "promotion_commentary") {
      return NextResponse.json({ commentary: content });
    }

    const missionId = `mission-${authResult.userId}-${Date.now()}`;
    const mission = parseGrokMissionPayload(content, missionId);

    if (!mission) {
      return NextResponse.json(
        { error: "Grok returned an invalid mission format. Please try again." },
        { status: 502 }
      );
    }

    if (generationRequest.topicAssignment) {
      await recordSharedGenerationOutput(authResult.userId, {
        topicIds: [generationRequest.topicAssignment.topicId],
        titles: [mission.title],
        scenarioIds: [missionId],
        amendmentTags: [generationRequest.topicAssignment.amendment],
      });
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error("Grok progression route error:", error);
    return NextResponse.json(
      { error: "Unable to reach Grok. Please try again shortly." },
      { status: 502 }
    );
  }
}