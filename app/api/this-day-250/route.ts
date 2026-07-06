import { NextResponse } from "next/server";

import { getAmerica250Highlight } from "@/lib/america250-events";
import {
  getThisDay250EntriesByDates,
  getThisDay250Entry,
  isThisDay250CacheConfigured,
  listThisDay250Archive,
} from "@/lib/this-day-250-cache";
import { getTodayDateString } from "@/lib/this-day-250";

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

  if (!isThisDay250CacheConfigured()) {
    return NextResponse.json({
      entry: null,
      america250Highlight,
      cached: false,
      message: "Today's history entry is being prepared.",
    });
  }

  const entry = await getThisDay250Entry(date);

  return NextResponse.json({
    entry,
    america250Highlight,
    cached: Boolean(entry),
    message: entry
      ? undefined
      : "Today's history entry is being prepared. Check back soon.",
  });
}