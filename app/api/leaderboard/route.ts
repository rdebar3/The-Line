import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getLeaderboardForUser,
  getTopEntries,
  isLeaderboardConfigured,
  LEADERBOARD_DISPLAY_LIMIT,
  removeUserFromLeaderboard,
} from "@/lib/leaderboard";

function stripUserId<T extends { userId: string }>(
  entry: T
): Omit<T, "userId"> {
  const { userId, ...publicEntry } = entry;
  void userId;
  return publicEntry;
}

export async function GET() {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({
      configured: false,
      entries: [],
      pinnedMe: null,
      me: null,
    });
  }

  try {
    const { userId } = await auth();

    if (!userId) {
      const entries = await getTopEntries(LEADERBOARD_DISPLAY_LIMIT);
      return NextResponse.json({
        configured: true,
        entries: entries.map(stripUserId),
        pinnedMe: null,
        me: null,
        isSignedIn: false,
      });
    }

    const { entries, pinnedMe, me } = await getLeaderboardForUser(userId);

    return NextResponse.json({
      configured: true,
      entries: entries.map((entry) => ({
        ...stripUserId(entry),
        isYou: entry.userId === userId,
      })),
      pinnedMe: pinnedMe
        ? { ...stripUserId(pinnedMe), isYou: true }
        : null,
      me: me
        ? {
            rank: me.rank,
            score: me.score,
            username: me.username,
            displayName: me.displayName,
            totalPlayers: me.totalPlayers,
            isDefaultUsername: me.isDefaultUsername,
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