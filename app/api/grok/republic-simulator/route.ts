import { NextResponse } from "next/server";

import { getPremiumStatus, requireAuth } from "@/lib/api-guards";
import {
  buildFallbackHistoricalReality,
  buildFallbackOutcome,
  buildHistoricalRealityUserPrompt,
  buildOutcomeUserPrompt,
  getRepublicSimulatorSystemPrompt,
  parseHistoricalPayload,
  parseOutcomePayload,
  type RepublicSimulatorGrokRequest,
} from "@/lib/republic-simulator-grok";
import {
  getChoiceById,
  getRepublicSimulatorRole,
  getRepublicSimulatorScenario,
} from "@/lib/republic-simulator";
import {
  consumeRepublicSimulatorDemo,
  getRepublicSimulatorDemoUsage,
} from "@/lib/server-usage-limits";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";

async function ensureRepublicSimulatorAccess(
  userId: string,
  isPremium: boolean,
  consumeDemo: boolean
) {
  if (isPremium) {
    return { allowed: true as const, error: null as null };
  }

  if (consumeDemo) {
    const usage = await consumeRepublicSimulatorDemo(userId);
    if (!usage.allowed) {
      return {
        allowed: false as const,
        error: NextResponse.json(
          {
            error:
              "Free demo complete. Unlock Full Access for unlimited Republic Simulator scenarios.",
          },
          { status: 403 }
        ),
      };
    }
    return { allowed: true as const, error: null as null };
  }

  const usage = await getRepublicSimulatorDemoUsage(userId);
  if (!usage.allowed) {
    return {
      allowed: false as const,
      error: NextResponse.json(
        {
          error:
            "Free demo complete. Unlock Full Access for unlimited Republic Simulator scenarios.",
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true as const, error: null as null };
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { isPremium } = await getPremiumStatus(authResult.userId);

  let body: RepublicSimulatorGrokRequest;

  try {
    body = (await request.json()) as RepublicSimulatorGrokRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const scenario = getRepublicSimulatorScenario(body.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 400 });
  }

  const decision = scenario.decisions.find((item) => item.id === body.decisionId);
  if (!decision) {
    return NextResponse.json({ error: "Unknown decision." }, { status: 400 });
  }

  const choice = getChoiceById(scenario, body.decisionId, body.choiceId);
  if (!choice) {
    return NextResponse.json({ error: "Unknown choice." }, { status: 400 });
  }

  const access = await ensureRepublicSimulatorAccess(
    authResult.userId,
    isPremium,
    body.action === "outcome" && body.decisionIndex === 0
  );
  if (!access.allowed) return access.error;

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    if (body.action === "historical-reality") {
      return NextResponse.json({
        ...buildFallbackHistoricalReality(decision),
        generated: false,
        fallback: true,
      });
    }

    const role =
      getRepublicSimulatorRole(
        body.action === "outcome" ? body.roleId : "madison"
      ) ?? getRepublicSimulatorRole("madison")!;

    return NextResponse.json({
      ...buildFallbackOutcome({ decision, choice, role }),
      generated: false,
      fallback: true,
    });
  }

  const systemPrompt = getRepublicSimulatorSystemPrompt();

  const userPrompt =
    body.action === "outcome"
      ? buildOutcomeUserPrompt({
          scenario,
          role:
            getRepublicSimulatorRole(body.roleId) ??
            getRepublicSimulatorRole("madison")!,
          decision,
          choice,
          decisionIndex: body.decisionIndex,
        })
      : buildHistoricalRealityUserPrompt({ scenario, decision, choice });

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Republic Simulator Grok error:", response.status, errorText);

      if (body.action === "historical-reality") {
        return NextResponse.json({
          ...buildFallbackHistoricalReality(decision),
          generated: false,
          fallback: true,
        });
      }

      const role = getRepublicSimulatorRole(body.roleId) ?? getRepublicSimulatorRole("madison")!;
      return NextResponse.json({
        ...buildFallbackOutcome({ decision, choice, role }),
        generated: false,
        fallback: true,
      });
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

    if (body.action === "historical-reality") {
      const parsed = parseHistoricalPayload(content);
      if (!parsed) {
        return NextResponse.json({
          ...buildFallbackHistoricalReality(decision),
          generated: false,
          fallback: true,
        });
      }

      return NextResponse.json({
        ...parsed,
        generated: true,
        fallback: false,
      });
    }

    const parsed = parseOutcomePayload(content);
    if (!parsed) {
      const role = getRepublicSimulatorRole(body.roleId) ?? getRepublicSimulatorRole("madison")!;
      return NextResponse.json({
        ...buildFallbackOutcome({ decision, choice, role }),
        generated: false,
        fallback: true,
      });
    }

    return NextResponse.json({
      ...parsed,
      generated: true,
      fallback: false,
    });
  } catch (error) {
    console.error("Republic Simulator route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}