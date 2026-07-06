import { NextResponse } from "next/server";

import { getAmerica250Highlight } from "@/lib/america250-events";
import {
  getThisDay250EntriesByDates,
  isThisDay250CacheConfigured,
  listThisDay250Archive,
} from "@/lib/this-day-250-cache";
import { getTodayDateString } from "@/lib/this-day-250";
import { getThisDay250ForPublic } from "@/lib/this-day-250-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const date = searchParams.get("date") ?? getTodayDateString();

  if (mode === "archive") {
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "30"))
    );
    const offset = Math.max(0, Number(searchParams.get("offset") ?? "0"));

    if (!isThisDay250CacheConfigured()) {
      return NextResponse.json({
        entries: [],
        total: 0,
        cached: false,
        message: "History archive not yet available.",
      });
    }

    const { dates, total } = await listThisDay250Archive({ limit, offset });
    const entries = await getThisDay250EntriesByDates(dates);

    return NextResponse.json({
      entries,
      total,
      cached: true,
    });
  }

  const america250Highlight = getAmerica250Highlight(date);

  try {
    const { entry, cached, message } = await getThisDay250ForPublic({
      calendarDate: date,
    });

    return NextResponse.json({
      entry,
      america250Highlight,
      cached,
      message,
    });
  } catch (error) {
    console.error("This Day 250 API error:", error);
    return NextResponse.json({
      entry: null,
      america250Highlight,
      cached: false,
      message: "Unable to load today's historical briefing. Try again shortly.",
    });
  }
}