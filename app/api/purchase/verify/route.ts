import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { grantPremiumToUser } from "@/lib/clerk-premium";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required to verify purchase." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 402 }
      );
    }

    const sessionUserId =
      session.metadata?.clerkUserId ?? session.client_reference_id;

    if (sessionUserId !== userId) {
      return NextResponse.json(
        { error: "This purchase belongs to a different account." },
        { status: 403 }
      );
    }

    const purchasedAt = new Date().toISOString();
    const premium = await grantPremiumToUser(userId, purchasedAt);

    return NextResponse.json({
      success: true,
      purchasedAt: premium.purchasedAt,
      price: (session.amount_total ?? 0) / 100,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}