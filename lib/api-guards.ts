import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getPremiumForUser } from "@/lib/clerk-premium";
import { TRIAL_ENDED_MESSAGE } from "@/lib/trial";

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null as null,
      error: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }

  return { userId, error: null as null };
}

export async function getPremiumStatus(userId: string) {
  const premium = await getPremiumForUser(userId);
  return {
    isPremium: premium.isPremium,
    purchasedAt: premium.purchasedAt,
    trial: premium.trial,
    hasFullAccess: premium.hasFullAccess,
  };
}

/**
 * Gates premium API features. Passes for purchasers AND accounts inside the
 * 7-day full-access trial window.
 */
export async function requirePremium(userId: string) {
  const { isPremium, hasFullAccess, trial } = await getPremiumStatus(userId);

  if (!hasFullAccess) {
    return {
      isPremium: false as const,
      error: NextResponse.json(
        {
          error:
            trial.endsAt !== null
              ? TRIAL_ENDED_MESSAGE
              : "Full access required. Unlock to use this feature.",
        },
        { status: 403 }
      ),
    };
  }

  // Note: `isPremium: true` here means "has full access" (purchase or trial),
  // preserving the existing call sites' contract.
  return { isPremium: true as const, error: null as null, trial, purchased: isPremium };
}
