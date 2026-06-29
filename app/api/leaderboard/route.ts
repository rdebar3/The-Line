import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getLeaderboardForUser,
  getTopEntries,
  isLeaderboardConfigured,
  removeUserFromLeaderboard,
} from "@/lib/leaderboard";

export async function GET() {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({
      configured: false,
      top10: [],
      me: null,
    });
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      const top10 = await getTopEntries(10);
      return NextResponse.json({
        configured: true,
        top10: top10.map(({ userId: _userId, ...entry }) => entry),
        me: null,
        isSignedIn: false,
      });
    }

    const { top10, me } = await getLeaderboardForUser(userId);

    return NextResponse.json({
      configured: true,
      top10: top10.map(({ userId: entryUserId, ...entry }) => ({
        ...entry,
        isYou: entryUserId === userId,
      })),
      me: me
        ? {
            rank: me.rank,
            score: me.score,
            username: me.username,
            totalPlayers: me.totalPlayers,
          }
        : null,
      isSignedIn: true,
    });
  } catch (error) {
    console.error("Leaderboard fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json(
      { error: "Leaderboard is not configured yet." },
      { status: 503 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required." },
      { status: 401 }
    );
  }

  try {
    await removeUserFromLeaderboard(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leaderboard remove failed:", error);
    return NextResponse.json(
      { error: "Failed to remove leaderboard entry." },
      { status: 500 }
    );
  }
}