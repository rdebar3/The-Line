import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLeaderboardConfigured, syncUserScore } from "@/lib/leaderboard";

export async function POST(request: Request) {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json(
      { error: "Leaderboard is not configured yet." },
      { status: 503 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required to sync your score." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      defenderScore?: number;
      checkIn?: boolean;
    };

    const defenderScore = Number(body.defenderScore);
    if (!Number.isFinite(defenderScore) || defenderScore < 0) {
      return NextResponse.json(
        { error: "Invalid defender score." },
        { status: 400 }
      );
    }

    const result = await syncUserScore(userId, defenderScore, {
      checkIn: body.checkIn === true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Leaderboard sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync score." },
      { status: 500 }
    );
  }
}