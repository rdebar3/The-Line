import { NextResponse } from "next/server";

import { getAdaptiveScenarioCount } from "@/lib/adaptive-intelligence";
import { getPremiumStatus, requireAuth } from "@/lib/api-guards";
import {
  buildAdaptiveDebriefUserPrompt,
  buildAdaptiveMissionUserPrompt,
  getAdaptiveDebriefSystemPrompt,
  getAdaptiveMissionSystemPrompt,
  parseAdaptiveMissionBatch,
  type AdaptiveDebriefRequest,
  type AdaptiveMissionGenerateRequest,
} from "@/lib/grok-adaptive";
import { GROK_CHAT_MODEL, XAI_CHAT_COMPLETIONS_URL } from "@/lib/grok";
import { consumeAdaptiveMissionGeneration } from "@/lib/server-usage-limits";

type AdaptiveMissionBody =
  | ({ action: "generate" } & AdaptiveMissionGenerateRequest)
  | ({ action: "debrief" } & AdaptiveDebriefRequest);

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Adaptive intelligence is not configured. Set XAI_API_KEY to enable personalized missions.",
      },
      { status: 503 }
    );
  }

  let body: AdaptiveMissionBody;

  try {
    body = (await request.json()) as AdaptiveMissionBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.action || !["generate", "debrief"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid adaptive mission action." }, { status: 400 });
  }

  const { isPremium } = await getPremiumStatus(authResult.userId);

  if (body.action === "generate") {
    if (
      !body.performanceSummary?.trim() ||
      !body.rankTitle?.trim() ||
      !Array.isArray(body.focusAreas)
    ) {
      return NextResponse.json(
        { error: "Invalid mission generation request." },
        { status: 400 }
      );
    }

    const usage = await consumeAdaptiveMissionGeneration(
      authResult.userId,
      isPremium
    );

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: isPremium
            ? "Daily personalized mission limit reached. Return tomorrow."
            : "Free tier includes 1 personalized mission per day. Unlock Full Access for deeper daily missions.",
          remaining: usage.remaining,
        },
        { status: 429 }
      );
    }

    const scenarioCount =
      body.scenarioCount ?? getAdaptiveScenarioCount(isPremium);

    const systemPrompt = getAdaptiveMissionSystemPrompt(scenarioCount, isPremium);
    const userPrompt = buildAdaptiveMissionUserPrompt({
      ...body,
      scenarioCount,
      isPremium,
    });

    try {
      const response = await fetch(XAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROK_CHAT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt.slice(0, 5000) },
          ],
          temperature: 0.4,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Grok adaptive mission error:", response.status, errorText);
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

      const mission = parseAdaptiveMissionBatch(content, scenarioCount);
      if (!mission) {
        return NextResponse.json(
          {
            error:
              "Grok returned an invalid mission format. Please try again.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        mission,
        scenarioCount: mission.scenarios.length,
        remaining: usage.remaining,
        isPremium,
      });
    } catch (error) {
      console.error("Adaptive mission route error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again." },
        { status: 500 }
      );
    }
  }

  if (
    !body.performanceSummary?.trim() ||
    !Array.isArray(body.focusAreas) ||
    !Array.isArray(body.results)
  ) {
    return NextResponse.json(
      { error: "Invalid debrief request." },
      { status: 400 }
    );
  }

  const systemPrompt = getAdaptiveDebriefSystemPrompt();
  const userPrompt = buildAdaptiveDebriefUserPrompt(body);

  try {
    const response = await fetch(XAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt.slice(0, 3000) },
        ],
        temperature: 0.55,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to generate mission debrief." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const debrief = data.choices?.[0]?.message?.content?.trim();
    if (!debrief) {
      return NextResponse.json(
        { error: "Grok returned an empty debrief." },
        { status: 502 }
      );
    }

    return NextResponse.json({ debrief });
  } catch (error) {
    console.error("Adaptive debrief route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}