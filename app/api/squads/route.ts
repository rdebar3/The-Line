import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLeaderboardConfigured } from "@/lib/leaderboard";
import { createSquad, getSquad, joinSquad, syncMemberSquadScore } from "@/lib/squads";

export async function GET(request: Request) {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({ configured: false, squad: null });
  }

  try {
    const { searchParams } = new URL(request.url);
    const squadId = searchParams.get("squadId");
    if (!squadId) {
      return NextResponse.json({ error: "squadId required" }, { status: 400 });
    }

    const squad = await getSquad(squadId);
    return NextResponse.json({ squad });
  } catch (error) {
    console.error("Squad GET failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load platoon.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isLeaderboardConfigured()) {
    return NextResponse.json({ error: "Squads not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: "create" | "join";
      name?: string;
      code?: string;
      defenderScore?: number;
    };

    if (body.action === "join" && body.code) {
      const squad = await joinSquad(userId, body.code);
      if (!squad) {
        return NextResponse.json({ error: "Invalid squad code." }, { status: 404 });
      }
      if (body.defenderScore !== undefined) {
        await syncMemberSquadScore(squad.id, userId, body.defenderScore);
        const refreshed = await getSquad(squad.id);
        return NextResponse.json({ squad: refreshed ?? squad });
      }
      return NextResponse.json({ squad });
    }

    const squad = await createSquad(userId, body.name ?? "Platoon");
    if (body.defenderScore !== undefined) {
      await syncMemberSquadScore(squad.id, userId, body.defenderScore);
      const refreshed = await getSquad(squad.id);
      return NextResponse.json({ squad: refreshed ?? squad });
    }
    return NextResponse.json({ squad });
  } catch (error) {
    console.error("Squad POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create platoon.",
      },
      { status: 500 }
    );
  }
}