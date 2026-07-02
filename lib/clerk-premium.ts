import { clerkClient } from "@clerk/nextjs/server";

import {
  isPremiumFromMetadata,
  type PremiumMetadata,
} from "@/lib/premium-status";

export type { PremiumMetadata } from "@/lib/premium-status";
export { isPremiumFromMetadata } from "@/lib/premium-status";

export async function getPremiumForUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata as PremiumMetadata;

  return {
    isPremium: isPremiumFromMetadata(metadata),
    purchasedAt: metadata.premiumPurchasedAt ?? null,
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