import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { mergeSavedLines, type SavedLine } from "@/lib/saved-lines";
import {
  isSavedLinesCloudConfigured,
  loadCloudSavedLines,
  saveCloudSavedLines,
} from "@/lib/saved-lines-cloud";

export async function GET() {
  if (!isSavedLinesCloudConfigured()) {
    return NextResponse.json({ configured: false, lines: [] });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const lines = (await loadCloudSavedLines(userId)) ?? [];
  return NextResponse.json({ configured: true, lines });
}

export async function PUT(request: Request) {
  if (!isSavedLinesCloudConfigured()) {
    return NextResponse.json({ error: "Cloud save not configured." }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { lines?: SavedLine[] };
    if (!Array.isArray(body.lines)) {
      return NextResponse.json({ error: "Missing lines." }, { status: 400 });
    }

    const remote = (await loadCloudSavedLines(userId)) ?? [];
    const merged = mergeSavedLines(body.lines, remote);
    await saveCloudSavedLines(userId, merged);

    return NextResponse.json({ success: true, lines: merged });
  } catch (error) {
    console.error("Saved lines sync failed:", error);
    return NextResponse.json({ error: "Failed to save lines." }, { status: 500 });
  }
}