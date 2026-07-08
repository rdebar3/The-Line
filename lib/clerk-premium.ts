import { clerkClient } from "@clerk/nextjs/server";

import {
  isPremiumFromMetadata,
  type PremiumMetadata,
} from "@/lib/premium-status";
import { getTrialState, type TrialState } from "@/lib/trial";

export type { PremiumMetadata } from "@/lib/premium-status";
export { isPremiumFromMetadata } from "@/lib/premium-status";

export type PremiumForUser = {
  isPremium: boolean;
  purchasedAt: string | null;
  /** 7-day full-access trial derived from account creation date. */
  trial: TrialState;
  /** True when the user should get premium features (purchased OR on trial). */
  hasFullAccess: boolean;
};

export async function getPremiumForUser(
  userId: string
): Promise<PremiumForUser> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata as PremiumMetadata;

  const isPremium = isPremiumFromMetadata(metadata);
  const trial = getTrialState(user.createdAt, isPremium);

  return {
    isPremium,
    purchasedAt: metadata.premiumPurchasedAt ?? null,
    trial,
    hasFullAccess: isPremium || trial.active,
  };
}

export async function grantPremiumToUser(userId: string, purchasedAt: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata as PremiumMetadata;

  if (metadata.premium === true) {
    return {
      isPremium: true,
      purchasedAt: metadata.premiumPurchasedAt ?? purchasedAt,
    };
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      premium: true,
      premiumPurchasedAt: purchasedAt,
    },
  });

  return { isPremium: true, purchasedAt };
}
