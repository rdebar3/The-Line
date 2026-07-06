import { NextResponse } from "next/server";

import { getTodayDateString } from "@/lib/this-day-250";
import { isThisDay250CacheConfigured } from "@/lib/this-day-250-cache";
import { ensureThisDay250Entry } from "@/lib/this-day-250-service";

/** Grok web search can take 30–90s; cron must outlive the default serverless limit. */
export const maxDuration = 120;

function verifyCronAuth(request: Request): boolean {
  // Vercel Cron sets this header on scheduled invocations (trusted on Vercel).
  if (request.headers.get("x-vercel-cron") === "1") return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isThisDay250CacheConfigured()) {
    return NextResponse.json(
      { error: "Redis is not configured. Cannot cache daily entry." },
      { status: 503 }
    );
  }

  const calendarDate = getTodayDateString();

  try {
    const { entry, cached, generated } = await ensureThisDay250Entry({
      calendarDate,
    });

    return NextResponse.json({
      ok: true,
      calendarDate,
      cached,
      generated,
      eventTitle: entry.eventTitle,
      citationUrl: entry.citationUrl,
      exactDateMatch: entry.exactDateMatch,
      historicalDate: entry.historicalDate,
      message: cached
        ? "Entry already exists for today."
        : "Generated and cached today's entry.",
    });
  } catch (error) {
    console.error("Cron this-day-250 error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily history entry." },
      { status: 500 }
    );
  }
}