import { NextResponse } from "next/server";

import {
  getThisDay250Entry,
  isThisDay250CacheConfigured,
  saveThisDay250Entry,
} from "@/lib/this-day-250-cache";
import { generateThisDay250Entry } from "@/lib/this-day-250-grok";
import { getTodayDateString } from "@/lib/this-day-250";

function verifyCronAuth(request: Request): boolean {
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
    const existing = await getThisDay250Entry(calendarDate);
    if (existing) {
      return NextResponse.json({
        ok: true,
        cached: true,
        calendarDate,
        eventTitle: existing.eventTitle,
        message: "Entry already exists for today.",
      });
    }

    const entry = await generateThisDay250Entry({ calendarDate });
    await saveThisDay250Entry(entry);

    return NextResponse.json({
      ok: true,
      cached: false,
      calendarDate,
      eventTitle: entry.eventTitle,
      citationUrl: entry.citationUrl,
      exactDateMatch: entry.exactDateMatch,
    });
  } catch (error) {
    console.error("Cron this-day-250 error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily history entry." },
      { status: 500 }
    );
  }
}