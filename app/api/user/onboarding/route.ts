import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getFirstLoginTutorialStatus,
  markFirstLoginTutorialComplete,
} from "@/lib/clerk-onboarding";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({
      completed: false,
      isSignedIn: false,
    });
  }

  const status = await getFirstLoginTutorialStatus(userId);

  return NextResponse.json({
    completed: status.completed,
    completedAt: status.completedAt,
    isSignedIn: true,
  });
}

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const result = await markFirstLoginTutorialComplete(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not save onboarding status." },
      { status: 500 }
    );
  }
}