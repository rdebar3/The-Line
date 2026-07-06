import { Redis } from "@upstash/redis";

import { isLeaderboardConfigured } from "@/lib/leaderboard";
import type { ThisDay250Entry } from "@/lib/this-day-250";

const ENTRY_PREFIX = "theline:day250:entry:";
const ARCHIVE_KEY = "theline:day250:archive";
const ADMIN_LOG_PREFIX = "theline:day250:admin-log:";

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

export function isThisDay250CacheConfigured(): boolean {
  return isLeaderboardConfigured();
}

function entryKey(calendarDate: string) {
  return `${ENTRY_PREFIX}${calendarDate}`;
}

export async function getThisDay250Entry(
  calendarDate: string
): Promise<ThisDay250Entry | null> {
  if (!isThisDay250CacheConfigured()) return null;

  const redis = getRedis();
  const entry = await redis.get<ThisDay250Entry>(entryKey(calendarDate));
  return entry ?? null;
}

export async function saveThisDay250Entry(entry: ThisDay250Entry): Promise<void> {
  if (!isThisDay250CacheConfigured()) {
    throw new Error("Redis is not configured.");
  }

  const redis = getRedis();
  const score = new Date(`${entry.id}T12:00:00Z`).getTime();

  await redis.set(entryKey(entry.id), entry);
  await redis.zadd(ARCHIVE_KEY, { score, member: entry.id });
  await redis.set(`${ADMIN_LOG_PREFIX}${entry.id}`, {
    calendarDate: entry.id,
    generatedAt: entry.generatedAt,
    eventTitle: entry.eventTitle,
    citationUrl: entry.citationUrl,
    citationLabel: entry.citationLabel,
    historicalDate: entry.historicalDate,
    exactDateMatch: entry.exactDateMatch,
    grokModel: entry.grokModel,
    allCitations: entry.allCitations,
  });
}

export async function listThisDay250Archive(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ dates: string[]; total: number }> {
  if (!isThisDay250CacheConfigured()) {
    return { dates: [], total: 0 };
  }

  const redis = getRedis();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const total = await redis.zcard(ARCHIVE_KEY);
  const dates = await redis.zrange<string[]>(
    ARCHIVE_KEY,
    offset,
    offset + limit - 1,
    { rev: true }
  );

  return { dates: dates ?? [], total: total ?? 0 };
}

export async function getThisDay250EntriesByDates(
  dates: string[]
): Promise<ThisDay250Entry[]> {
  if (!isThisDay250CacheConfigured() || dates.length === 0) return [];

  const redis = getRedis();
  const keys = dates.map((date) => entryKey(date));
  const entries = await redis.mget<ThisDay250Entry[]>(...keys);

  return (entries ?? []).filter(
    (entry): entry is ThisDay250Entry => entry !== null
  );
}

export type ThisDay250AdminLogEntry = {
  calendarDate: string;
  generatedAt: string;
  eventTitle: string;
  citationUrl: string;
  citationLabel: string;
  historicalDate: string;
  exactDateMatch: boolean;
  grokModel: string;
  allCitations: string[];
};

export async function listThisDay250AdminLogs(options?: {
  limit?: number;
}): Promise<ThisDay250AdminLogEntry[]> {
  if (!isThisDay250CacheConfigured()) return [];

  const redis = getRedis();
  const { dates } = await listThisDay250Archive({
    limit: options?.limit ?? 100,
    offset: 0,
  });

  if (dates.length === 0) return [];

  const keys = dates.map((date) => `${ADMIN_LOG_PREFIX}${date}`);
  const logs = await redis.mget<ThisDay250AdminLogEntry[]>(...keys);

  return (logs ?? []).filter(
    (log): log is ThisDay250AdminLogEntry => log !== null
  );
}