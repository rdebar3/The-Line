import { Redis } from "@upstash/redis";

import { isLeaderboardConfigured } from "@/lib/leaderboard";
import { getWeekId } from "@/lib/weekly-challenge";

const WEEKLY_PREFIX = "theline:weekly:";
const PROFILE_PREFIX = "theline:profile:";

export type WeeklyLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
};

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!isLeaderboardConfigured()) {
    throw new Error("Weekly leaderboard storage is not configured.");
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

function weeklyKey(weekId = getWeekId()) {
  return `${WEEKLY_PREFIX}${weekId}`;
}

async function readUsername(userId: string): Promise<string | null> {
  const redis = getRedis();
  const profile = await redis.hgetall<{ username?: string }>(
    `${PROFILE_PREFIX}${userId}`
  );
  const username = profile?.username?.trim();
  return username || null;
}

export async function syncWeeklyChallengeScore(
  userId: string,
  sessionScore: number,
  weekId = getWeekId()
): Promise<void> {
  const redis = getRedis();
  const key = weeklyKey(weekId);
  const sanitized = Math.max(0, Math.floor(sessionScore));
  const current = await redis.zscore(key, userId);
  const stored = current === null ? 0 : Math.max(0, Math.floor(Number(current)));
  const scoreToStore = Math.max(stored, sanitized);

  if (scoreToStore > stored || current === null) {
    await redis.zadd(key, { score: scoreToStore, member: userId });
    await redis.expire(key, 60 * 60 * 24 * 21);
  }
}

export async function getWeeklyTopEntries(
  limit = 5,
  weekId = getWeekId()
): Promise<WeeklyLeaderboardEntry[]> {
  const redis = getRedis();
  const rows = await redis.zrange(weeklyKey(weekId), 0, 49, {
    rev: true,
    withScores: true,
  });

  const entries: WeeklyLeaderboardEntry[] = [];

  for (let index = 0; index < rows.length; index += 2) {
    const memberId = String(rows[index]);
    const score = Number(rows[index + 1]);
    const username = await readUsername(memberId);
    if (!username) continue;

    entries.push({
      rank: entries.length + 1,
      userId: memberId,
      username,
      score,
    });

    if (entries.length >= limit) break;
  }

  return entries;
}