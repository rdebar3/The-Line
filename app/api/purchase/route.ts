import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getPremiumForUser } from "@/lib/clerk-premium";
import { PREMIUM_PRICE } from "@/lib/subscription";
import { getAppOrigin, getStripe } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({
      isPremium: false,
      purchasedAt: null,
      isSignedIn: false,
    });
  }

  const premium = await getPremiumForUser(userId);

  return NextResponse.json({
    isPremium: premium.isPremium,
    purchasedAt: premium.purchasedAt,
    isSignedIn: true,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required to purchase." },
      { status: 401 }
    );
  }

  try {
    const existing = await getPremiumForUser(userId);
    if (existing.isPremium) {
      return NextResponse.json(
        { error: "Full experience already unlocked for this account." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const origin = getAppOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(PREMIUM_PRICE * 100),
            product_data: {
              name: "The Line — Full Experience",
              description:
                "One-time unlock: all scenarios, unlimited Grok counsel, Arsenal, and full passage depth.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=canceled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout could not be started.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}