import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { grantPremiumToUser } from "@/lib/clerk-premium";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";
    console.error("Stripe webhook verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const userId =
        session.metadata?.clerkUserId ?? session.client_reference_id;

      if (userId) {
        try {
          await grantPremiumToUser(userId, new Date().toISOString());
        } catch (error) {
          console.error("Failed to grant premium from webhook:", error);
          return NextResponse.json(
            { error: "Failed to grant premium." },
            { status: 500 }
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}