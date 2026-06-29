import { NextResponse } from "next/server";

import { requireAuth, requirePremium } from "@/lib/api-guards";
import {
  RIGHTS_SYSTEM_PROMPT,
  type ChatMessage,
  type GrokChatRequest,
} from "@/lib/grok";
import {
  TEASER_SYSTEM_PROMPT,
  buildTeaserUserPrompt,
} from "@/lib/grok-teaser";
import { consumeTeaserUse } from "@/lib/server-usage-limits";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_MODEL = "grok-3-mini";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Grok is not configured. Set XAI_API_KEY in your environment to enable constitutional rights chat.",
      },
      { status: 503 }
    );
  }

  let body: GrokChatRequest;

  try {
    body = (await request.json()) as GrokChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;
  const isTeaser = body.mode !== "full";

  if (!isTeaser) {
    const premiumResult = await requirePremium(authResult.userId);
    if (premiumResult.error) return premiumResult.error;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 }
    );
  }

  const lastMessage = messages[messages.length - 1];

  if (lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return NextResponse.json(
      { error: "A non-empty user message is required." },
      { status: 400 }
    );
  }

  if (messages.length > (isTeaser ? 1 : 20)) {
    return NextResponse.json(
      {
        error: isTeaser
          ? "Teaser allows one question at a time."
          : "Conversation limit reached. Start a new thread.",
      },
      { status: 400 }
    );
  }

  if (isTeaser) {
    const usage = await consumeTeaserUse(authResult.userId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Daily free counsel limit reached. Unlock for unlimited access.",
          remaining: usage.remaining,
        },
        { status: 429 }
      );
    }
  }

  const sanitized = sanitizeMessages(messages);
  const userContent = isTeaser
    ? buildTeaserUserPrompt(lastMessage.content, body.context)
    : (sanitized[sanitized.length - 1]?.content ?? lastMessage.content);

  const apiMessages = isTeaser
    ? [
        { role: "system" as const, content: TEASER_SYSTEM_PROMPT },
        { role: "user" as const, content: userContent },
      ]
    : [
        { role: "system" as const, content: RIGHTS_SYSTEM_PROMPT },
        ...sanitized,
      ];

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: apiMessages,
        temperature: isTeaser ? 0.5 : 0.3,
        max_tokens: isTeaser ? 200 : 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
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

    return NextResponse.json({
      message: content,
      mode: isTeaser ? "teaser" : "full",
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}