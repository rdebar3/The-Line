import { Redis } from "@upstash/redis";

import type { ProgressionState } from "@/lib/progression";
import { isLeaderboardConfigured } from "@/lib/leaderboard";

const PROGRESSION_PREFIX = "theline:progression:";

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

export function isCloudSaveConfigured() {
  return isLeaderboardConfigured();
}

export async function loadCloudProgression(
  userId: string
): Promise<Partial<ProgressionState> | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${PROGRESSION_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<ProgressionState>;
  } catch {
    return null;
  }
}

export async function saveCloudProgression(
  userId: string,
  state: ProgressionState
): Promise<void> {
  const redis = getRedis();
  const payload: Partial<ProgressionState> = {
    defenderScore: state.defenderScore,
    dailyStreak: state.dailyStreak,
    longestStreak: state.longestStreak,
    correctStreak: state.correctStreak,
    weakAreas: state.weakAreas,
    earnedBadges: state.earnedBadges,
    weeklyChallenge: state.weeklyChallenge,
    onboarding: state.onboarding,
    squadId: state.squadId,
    cloudSyncedAt: new Date().toISOString(),
  };
  await redis.set(`${PROGRESSION_PREFIX}${userId}`, JSON.stringify(payload));
}