import { NextResponse } from "next/server";

import {
  getThisDay250EntriesByDates,
  isThisDay250CacheConfigured,
  listThisDay250AdminLogs,
  listThisDay250Archive,
} from "@/lib/this-day-250-cache";

function verifyOperatorAuth(request: Request): boolean {
  const secret = process.env.OPERATOR_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const { searchParams } = new URL(request.url);
  return searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!verifyOperatorAuth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isThisDay250CacheConfigured()) {
    return NextResponse.json({
      logs: [],
      entries: [],
      total: 0,
      message: "Redis not configured.",
    });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    200,
    Math.max(1, Number(searchParams.get("limit") ?? "60"))
  );

  const [logs, archive] = await Promise.all([
    listThisDay250AdminLogs({ limit }),
    listThisDay250Archive({ limit, offset: 0 }),
  ]);

  const entries = await getThisDay250EntriesByDates(archive.dates);

  return NextResponse.json({
    logs,
    entries,
    total: archive.total,
  });
}