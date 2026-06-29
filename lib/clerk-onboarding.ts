import { clerkClient } from "@clerk/nextjs/server";

import type { PremiumMetadata } from "@/lib/clerk-premium";

export type UserPublicMetadata = PremiumMetadata & {
  firstLoginTutorialCompleted?: boolean;
  firstLoginTutorialCompletedAt?: string;
};

export function isFirstLoginTutorialComplete(
  metadata: UserPublicMetadata | null | undefined
) {
  return metadata?.firstLoginTutorialCompleted === true;
}

export async function getFirstLoginTutorialStatus(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata as UserPublicMetadata;

  return {
    completed: isFirstLoginTutorialComplete(metadata),
    completedAt: metadata.firstLoginTutorialCompletedAt ?? null,
  };
}

export async function markFirstLoginTutorialComplete(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata as UserPublicMetadata;

  if (isFirstLoginTutorialComplete(metadata)) {
    return {
      completed: true,
      completedAt: metadata.firstLoginTutorialCompletedAt ?? null,
    };
  }

  const completedAt = new Date().toISOString();

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      firstLoginTutorialCompleted: true,
      firstLoginTutorialCompletedAt: completedAt,
    },
  });

  return { completed: true, completedAt };
}