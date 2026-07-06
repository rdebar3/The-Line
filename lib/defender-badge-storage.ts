import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";

import type { DefenderBadgeAchievementId, DefenderBadgeRecord } from "@/lib/defender-badges";
import {
  formatLeaderboardDisplayName,
  isDefaultLeaderboardUsername,
} from "@/lib/leaderboard-username";
import { isLeaderboardConfigured } from "@/lib/leaderboard";

const BADGES_PREFIX = "theline:defender-badges:";
const BADGE_ENTRY_PREFIX = "theline:defender-badge:";

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!isLeaderboardConfigured()) {
    throw new Error("Redis is not configured.");
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}

export function isDefenderBadgeStorageConfigured(): boolean {
  return (
    isLeaderboardConfigured() &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  );
}

function badgesListKey(userId: string) {
  return `${BADGES_PREFIX}${userId}`;
}

function badgeEntryKey(userId: string, achievementId: DefenderBadgeAchievementId) {
  return `${BADGE_ENTRY_PREFIX}${userId}:${achievementId}`;
}

export async function getUserDisplayName(userId: string): Promise<string> {
  if (!isLeaderboardConfigured()) return "Defender";

  const redis = getRedis();
  const profile = await redis.hgetall<{ username?: string }>(
    `theline:profile:${userId}`
  );
  const username = profile?.username?.trim();

  if (!username || isDefaultLeaderboardUsername(username)) {
    return "Defender";
  }

  return formatLeaderboardDisplayName(username);
}

export async function getDefenderBadge(
  userId: string,
  achievementId: DefenderBadgeAchievementId
): Promise<DefenderBadgeRecord | null> {
  if (!isLeaderboardConfigured()) return null;

  const redis = getRedis();
  const entry = await redis.get<DefenderBadgeRecord>(
    badgeEntryKey(userId, achievementId)
  );
  return entry ?? null;
}

export async function listDefenderBadges(
  userId: string
): Promise<DefenderBadgeRecord[]> {
  if (!isLeaderboardConfigured()) return [];

  const redis = getRedis();
  const ids =
    (await redis.get<DefenderBadgeAchievementId[]>(badgesListKey(userId))) ?? [];

  if (ids.length === 0) return [];

  const keys = ids.map((id) => badgeEntryKey(userId, id));
  const entries = await redis.mget<DefenderBadgeRecord[]>(...keys);

  return (entries ?? []).filter(
    (entry): entry is DefenderBadgeRecord => entry !== null
  );
}

export async function saveDefenderBadge(
  userId: string,
  record: DefenderBadgeRecord
): Promise<void> {
  const redis = getRedis();

  await redis.set(badgeEntryKey(userId, record.id), record);

  const existing =
    (await redis.get<DefenderBadgeAchievementId[]>(badgesListKey(userId))) ?? [];

  if (!existing.includes(record.id)) {
    await redis.set(badgesListKey(userId), [...existing, record.id]);
  }
}

export async function uploadDefenderBadgeImage(options: {
  userId: string;
  achievementId: DefenderBadgeAchievementId;
  imageBytes: Buffer;
}): Promise<{ url: string; pathname: string }> {
  const pathname = `defender-badges/${options.userId}/${options.achievementId}.png`;

  const blob = await put(pathname, options.imageBytes, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}