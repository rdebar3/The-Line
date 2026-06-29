import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getPremiumForUser } from "@/lib/clerk-premium";

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
  };
}

export async function requirePremium(userId: string) {
  const { isPremium } = await getPremiumStatus(userId);

  if (!isPremium) {
    return {
      isPremium: false as const,
      error: NextResponse.json(
        { error: "Full access required. Unlock to use this feature." },
        { status: 403 }
      ),
    };
  }

  return { isPremium: true as const, error: null as null };
}