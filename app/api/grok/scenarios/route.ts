import { NextResponse } from "next/server";

import { getPremiumStatus, requireAuth } from "@/lib/api-guards";
import {
  buildScenarioGenerationUserPrompt,
  getScenarioGenerationSystemPrompt,
  parseGrokScenariosPayload,
  type GrokScenarioRequest,
} from "@/lib/grok-scenarios";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";
import { consumeScenarioGeneration } from "@/lib/server-usage-limits";
import { buildFallbackSession } from "@/lib/scenarios";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";

function isValidDifficulty(value: string): value is ScenarioDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function fallbackResponse(
  body: GrokScenarioRequest,
  message: string
) {
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

  const systemPrompt = getScenarioGenerationSystemPrompt(body.difficulty);
  const userPrompt = buildScenarioGenerationUserPrompt({
    ...body,
    isPremium,
    weakAreas: body.weakAreas ?? [],
    previousScenarioIds: body.previousScenarioIds ?? [],
    previousScenarioTitles: body.previousScenarioTitles ?? [],
    recentTopicIds: body.recentTopicIds ?? [],
    topicAssignments: body.topicAssignments ?? [],
  });

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt.slice(0, 12000) },
        ],
        temperature: isPremium ? 0.72 : 0.68,
        max_tokens: Math.min(6000, 900 * body.sessionSize + 500),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok scenarios API error:", response.status, errorText);

      return fallbackResponse(
        body,
        "Grok unavailable — deployed curated fallback scenarios."
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Grok returned an empty response." },
        { status: 502 }
      );
    }

    let scenarios = parseGrokScenariosPayload(
      content,
      body.difficulty,
      body.sessionSeed ?? Date.now()
    );

    if (scenarios.length < body.sessionSize) {
      const fallback = buildFallbackSession({
        size: body.sessionSize - scenarios.length,
        difficulty: body.difficulty,
        weakAreas: body.weakAreas ?? [],
        excludeIds: scenarios.map((scenario) => scenario.id),
        topicAssignments: (body.topicAssignments ?? []).slice(
          scenarios.length
        ),
      });
      scenarios = [...scenarios, ...fallback].slice(0, body.sessionSize);
    }

    if (scenarios.length === 0) {
      return NextResponse.json(
        { error: "Grok returned invalid scenarios. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      scenarios,
      difficulty: body.difficulty,
      generated: true,
      fallback: false,
    });
  } catch (error) {
    console.error("Grok scenarios route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}