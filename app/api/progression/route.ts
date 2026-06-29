import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLeaderboardConfigured } from "@/lib/leaderboard";
import { mergeCloudProgressionState, type ProgressionState } from "@/lib/progression";
import {
  isCloudSaveConfigured,
  loadCloudProgression,
  saveCloudProgression,
} from "@/lib/progression-cloud";
import { syncMemberSquadScore } from "@/lib/squads";

export async function GET() {
  if (!isCloudSaveConfigured()) {
    return NextResponse.json({ configured: false, state: null });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const state = await loadCloudProgression(userId);
  return NextResponse.json({ configured: true, state });
}

export async function PUT(request: Request) {
  if (!isCloudSaveConfigured()) {
    return NextResponse.json({ error: "Cloud save not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { state: ProgressionState };
    if (!body.state) {
      return NextResponse.json({ error: "Missing state." }, { status: 400 });
    }

    const remote = await loadCloudProgression(userId);
    const merged = remote
      ? mergeCloudProgressionState(body.state, remote)
      : body.state;

    await saveCloudProgression(userId, merged);

    if (merged.squadId && isLeaderboardConfigured()) {
      await syncMemberSquadScore(
        merged.squadId,
        userId,
        merged.defenderScore
      );
    }

    return NextResponse.json({ success: true, state: merged });
  } catch (error) {
    console.error("Cloud save failed:", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}