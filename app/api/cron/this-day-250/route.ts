import { NextResponse } from "next/server";

import { getTodayDateString } from "@/lib/this-day-250";
import { isThisDay250CacheConfigured } from "@/lib/this-day-250-cache";
import { ensureThisDay250Entry } from "@/lib/this-day-250-service";

/** Grok web search can take 30–90s; cron must outlive the default serverless limit. */
export const maxDuration = 120;

/**
 * Vercel Cron auth.
 *
 * When a CRON_SECRET env var exists, Vercel sends it on every scheduled
 * invocation as `Authorization: Bearer <CRON_SECRET>` — require it strictly.
 *
 * Without a secret configured, fall back to the `x-vercel-cron-schedule`
 * header that Vercel attaches to cron invocations. (The previous check
 * looked for `x-vercel-cron: 1`, which Vercel never sends — every cron run
 * was rejected with 401.)
 */
function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    return request.headers.get("authorization") === `Bearer ${secret}`;
  }

  return Boolean(request.headers.get("x-vercel-cron-schedule"));
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    console.warn("Cron this-day-250: unauthorized invocation rejected.", {
      hasCronScheduleHeader: Boolean(
        request.headers.get("x-vercel-cron-schedule")
      ),
      hasAuthHeader: Boolean(request.headers.get("authorization")),
      cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    });
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