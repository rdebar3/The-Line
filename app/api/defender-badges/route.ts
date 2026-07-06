import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  isDefenderBadgeStorageConfigured,
  listDefenderBadges,
} from "@/lib/defender-badge-storage";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!isDefenderBadgeStorageConfigured()) {
    return NextResponse.json({ configured: false, badges: [] });
  }

  const badges = await listDefenderBadges(userId);
  return NextResponse.json({ configured: true, badges });
}