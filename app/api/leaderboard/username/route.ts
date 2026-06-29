import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLeaderboardConfigured, setUsername } from "@/lib/leaderboard";
import { validateUsername } from "@/lib/leaderboard-username";

export async function PUT(request: Request) {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json(
      { error: "Leaderboard is not configured yet." },
      { status: 503 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required to set a username." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as { username?: string };

    if (!body.username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    const validationError = validateUsername(body.username);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await setUsername(userId, body.username);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save username.";

    if (message.includes("already taken")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error("Username update failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}