import { Redis } from "@upstash/redis";

import { FREE_GROK_DAILY_LIMIT, getTodayDateString } from "@/lib/grok-teaser";
import { isLeaderboardConfigured } from "@/lib/leaderboard";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const TEASER_PREFIX = "theline:teaser:";
const SCENARIO_GEN_PREFIX = "theline:scenegen:";

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!isLeaderboardConfigured()) return null;

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}

function dailyKey(prefix: string, userId: string) {
  return `${prefix}${userId}:${getTodayDateString()}`;
}

export async function consumeTeaserUse(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  uses: number;
  tracked: boolean;
}> {
  const redis = getRedis();

  if (!redis) {
    return {
      allowed: true,
      remaining: FREE_GROK_DAILY_LIMIT,
      uses: 0,
      tracked: false,
    };
  }

  const key = dailyKey(TEASER_PREFIX, userId);
  const uses = await redis.incr(key);

  if (uses === 1) {
    await redis.expire(key, 60 * 60 * 48);
  }

  if (uses > FREE_GROK_DAILY_LIMIT) {
    await redis.decr(key);
    return {
      allowed: false,
      remaining: 0,
      uses: FREE_GROK_DAILY_LIMIT,
      tracked: true,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, FREE_GROK_DAILY_LIMIT - uses),
    uses,
    tracked: true,
  };
}

export async function consumeScenarioGeneration(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  uses: number;
  tracked: boolean;
}> {
  const redis = getRedis();

  if (!redis) {
    return {
      allowed: true,
      remaining: FREE_DAILY_SCENARIO_GENERATION_LIMIT,
      uses: 0,
      tracked: false,
    };
  }

  const key = dailyKey(SCENARIO_GEN_PREFIX, userId);
  const uses = await redis.incr(key);

  if (uses === 1) {
    await redis.expire(key, 60 * 60 * 48);
  }

  if (uses > FREE_DAILY_SCENARIO_GENERATION_LIMIT) {
    await redis.decr(key);
    return {
      allowed: false,
      remaining: 0,
      uses: FREE_DAILY_SCENARIO_GENERATION_LIMIT,
      tracked: true,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, FREE_DAILY_SCENARIO_GENERATION_LIMIT - uses),
    uses,
    tracked: true,
  };
}