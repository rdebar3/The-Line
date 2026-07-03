import { Redis } from "@upstash/redis";

import type { SavedLine } from "@/lib/saved-lines";
import { isLeaderboardConfigured } from "@/lib/leaderboard";

const SAVED_LINES_PREFIX = "theline:saved-lines:";

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!isLeaderboardConfigured()) {
    throw new Error("Cloud storage is not configured.");
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

export function isSavedLinesCloudConfigured() {
  return isLeaderboardConfigured();
}

export async function loadCloudSavedLines(
  userId: string
): Promise<SavedLine[] | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${SAVED_LINES_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

export async function saveCloudSavedLines(
  userId: string,
  lines: SavedLine[]
): Promise<void> {
  const redis = getRedis();
  await redis.set(`${SAVED_LINES_PREFIX}${userId}`, JSON.stringify(lines));
}