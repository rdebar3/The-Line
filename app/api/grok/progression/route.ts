import { NextResponse } from "next/server";

import { requireAuth, requirePremium } from "@/lib/api-guards";
import {
  buildProgressionUserPrompt,
  getProgressionSystemPrompt,
  parseGrokMissionPayload,
  type GrokProgressionRequest,
} from "@/lib/grok-progression";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";

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

  let body: GrokProgressionRequest;

  try {
    body = (await request.json()) as GrokProgressionRequest;
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

  const systemPrompt = getProgressionSystemPrompt(body.action);
  const userPrompt = buildProgressionUserPrompt(body);

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
          { role: "user", content: userPrompt.slice(0, 4000) },
        ],
        temperature: body.action === "promotion_commentary" ? 0.5 : 0.35,
        max_tokens: body.action === "promotion_commentary" ? 600 : 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok progression API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Unable to reach Grok. Please try again shortly." },
        { status: 502 }
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

    if (body.action === "promotion_commentary") {
      return NextResponse.json({ commentary: content });
    }

    const mission = parseGrokMissionPayload(
      content,
      `mission-${authResult.userId}-${Date.now()}`
    );

    if (!mission) {
      return NextResponse.json(
        { error: "Grok returned an invalid mission format. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ mission });
  } catch (error) {
    console.error("Grok progression route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}