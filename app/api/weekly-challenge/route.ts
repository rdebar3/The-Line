import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLeaderboardConfigured } from "@/lib/leaderboard";
import {
  getWeeklyTopEntries,
  syncWeeklyChallengeScore,
} from "@/lib/weekly-leaderboard";
import { getWeekId } from "@/lib/weekly-challenge";

export async function GET() {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const weekId = getWeekId();
  const entries = await getWeeklyTopEntries(5, weekId);
  return NextResponse.json({ configured: true, weekId, entries });
}

export async function POST(request: Request) {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({ error: "Weekly board not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as { sessionScore?: number; weekId?: string };
  const sessionScore = Math.max(0, Math.floor(body.sessionScore ?? 0));
  const weekId = body.weekId ?? getWeekId();

  await syncWeeklyChallengeScore(userId, sessionScore, weekId);
  return NextResponse.json({ success: true });
}