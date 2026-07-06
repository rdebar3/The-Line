import { NextResponse } from "next/server";

import { getPremiumStatus, requireAuth } from "@/lib/api-guards";
import {
  buildScenarioGenerationUserPrompt,
  getScenarioGenerationSystemPrompt,
  parseGrokScenariosPayload,
  type GrokScenarioRequest,
} from "@/lib/grok-scenarios";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";
import {
  callGrokCompletion,
  prepareSharedGeneration,
  recordSharedGenerationOutput,
} from "@/lib/shared-generator";
import { consumeScenarioGeneration } from "@/lib/server-usage-limits";
import { buildFallbackSession } from "@/lib/scenarios";

function isValidDifficulty(value: string): value is ScenarioDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function fallbackResponse(body: GrokScenarioRequest, message: string) {
  const fallback = buildFallbackSession({
    size: body.sessionSize,
    difficulty: body.difficulty,
    weakAreas: body.weakAreas ?? [],
    topicAssignments: body.topicAssignments ?? [],
  });

  return NextResponse.json({
    scenarios: fallback,
    difficulty: body.difficulty,
    generated: false,
    fallback: true,
    message,
  });
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { isPremium } = await getPremiumStatus(authResult.userId);

  let body: GrokScenarioRequest;

  try {
    body = (await request.json()) as GrokScenarioRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    !body.difficulty ||
    !isValidDifficulty(body.difficulty) ||
    !body.rankTitle?.trim() ||
    !body.sessionSize ||
    body.sessionSize < 1 ||
    body.sessionSize > 8 ||
    !body.performanceSummary?.trim()
  ) {
    return NextResponse.json(
      { error: "Invalid scenario generation request." },
      { status: 400 }
    );
  }

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return fallbackResponse(
      body,
      "Using curated scenarios — Grok is not configured."
    );
  }

  if (!isPremium) {
    const usage = await consumeScenarioGeneration(authResult.userId);

    if (!usage.allowed) {
      return fallbackResponse(
        body,
        "Daily free scenario limit reached — using curated scenarios."
      );
    }
  }

  const sessionSeed = body.sessionSeed ?? Date.now();
  const { history, topicAssignment } = await prepareSharedGeneration(
    authResult.userId,
    {
      mode: "session",
      difficulty: body.difficulty,
      weakAreas: body.weakAreas ?? [],
      recentTopicIds: body.recentTopicIds ?? [],
      recentAmendmentTags: [],
      sessionTopicIds: body.sessionTopicIds ?? [],
      scenarioIndexInSession: body.scenarioIndexInSession ?? 0,
      sessionSeed,
      clientHistory: {
        topicIds: [
          ...(body.recentTopicIds ?? []),
          ...(body.sessionTopicIds ?? []),
        ],
        titles: body.previousScenarioTitles ?? [],
        scenarioIds: body.previousScenarioIds ?? [],
      },
    }
  );

  const generationRequest: GrokScenarioRequest = {
    ...body,
    isPremium,
    weakAreas: body.weakAreas ?? [],
    previousScenarioIds: body.previousScenarioIds ?? [],
    previousScenarioTitles: body.previousScenarioTitles ?? [],
    recentTopicIds: body.recentTopicIds ?? [],
    topicAssignments: [topicAssignment],
    sessionSeed,
    generationHistory: history,
  };

  const systemPrompt = getScenarioGenerationSystemPrompt(body.difficulty);
  const userPrompt = buildScenarioGenerationUserPrompt(generationRequest);

  try {
    const content = await callGrokCompletion({
      systemPrompt,
      userPrompt: userPrompt.slice(0, 12000),
      temperature: isPremium ? 0.72 : 0.68,
      maxTokens: Math.min(6000, 900 * body.sessionSize + 500),
    });

    let scenarios = parseGrokScenariosPayload(
      content,
      body.difficulty,
      sessionSeed
    );

    if (scenarios.length < body.sessionSize) {
      const fallback = buildFallbackSession({
        size: body.sessionSize - scenarios.length,
        difficulty: body.difficulty,
        weakAreas: body.weakAreas ?? [],
        excludeIds: scenarios.map((scenario) => scenario.id),
        topicAssignments: [topicAssignment].slice(scenarios.length),
      });
      scenarios = [...scenarios, ...fallback].slice(0, body.sessionSize);
    }

    if (scenarios.length === 0) {
      return NextResponse.json(
        { error: "Grok returned invalid scenarios. Please try again." },
        { status: 502 }
      );
    }

    await recordSharedGenerationOutput(authResult.userId, {
      topicIds: [topicAssignment.topicId],
      titles: scenarios.map((scenario) => scenario.title),
      scenarioIds: scenarios.map((scenario) => scenario.id),
      amendmentTags: [topicAssignment.amendment],
    });

    return NextResponse.json({
      scenarios,
      difficulty: body.difficulty,
      generated: true,
      fallback: false,
      assignedTopicId: topicAssignment.topicId,
    });
  } catch (error) {
    console.error("Grok scenarios route error:", error);

    if (error instanceof Error && error.message.startsWith("Grok API error")) {
      return fallbackResponse(
        body,
        "Grok unavailable — deployed curated fallback scenarios."
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}