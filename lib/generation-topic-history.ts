import { Redis } from "@upstash/redis";

import { isLeaderboardConfigured } from "@/lib/leaderboard";

const HISTORY_PREFIX = "theline:genhistory:";
const HISTORY_TTL_SECONDS = 60 * 60 * 24 * 30;
export const MAX_GENERATION_HISTORY = 40;

export type GenerationTopicHistory = {
  topicIds: string[];
  scenarioTitles: string[];
  scenarioIds: string[];
  amendmentTags: string[];
  updatedAt: string;
};

export type GenerationHistoryInput = {
  topicIds?: string[];
  titles?: string[];
  scenarioIds?: string[];
  amendmentTags?: string[];
};

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

function historyKey(userId: string) {
  return `${HISTORY_PREFIX}${userId}`;
}

function emptyHistory(): GenerationTopicHistory {
  return {
    topicIds: [],
    scenarioTitles: [],
    scenarioIds: [],
    amendmentTags: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeHistory(
  value: Partial<GenerationTopicHistory> | null | undefined
): GenerationTopicHistory {
  if (!value) return emptyHistory();

  return {
    topicIds: Array.isArray(value.topicIds)
      ? value.topicIds.slice(-MAX_GENERATION_HISTORY)
      : [],
    scenarioTitles: Array.isArray(value.scenarioTitles)
      ? value.scenarioTitles.slice(-MAX_GENERATION_HISTORY)
      : [],
    scenarioIds: Array.isArray(value.scenarioIds)
      ? value.scenarioIds.slice(-MAX_GENERATION_HISTORY)
      : [],
    amendmentTags: Array.isArray(value.amendmentTags)
      ? value.amendmentTags.slice(-MAX_GENERATION_HISTORY)
      : [],
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
  };
}

function mergeUniqueTail(
  primary: string[],
  secondary: string[],
  limit = MAX_GENERATION_HISTORY
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const value of [...primary, ...secondary]) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    merged.push(trimmed);
  }

  return merged.slice(-limit);
}

export function mergeGenerationHistories(
  server: GenerationTopicHistory,
  client?: GenerationHistoryInput
): GenerationTopicHistory {
  if (!client) return server;

  return {
    topicIds: mergeUniqueTail(
      server.topicIds,
      client.topicIds ?? [],
      MAX_GENERATION_HISTORY
    ),
    scenarioTitles: mergeUniqueTail(
      server.scenarioTitles,
      client.titles ?? [],
      MAX_GENERATION_HISTORY
    ),
    scenarioIds: mergeUniqueTail(
      server.scenarioIds,
      client.scenarioIds ?? [],
      MAX_GENERATION_HISTORY
    ),
    amendmentTags: mergeUniqueTail(
      server.amendmentTags,
      client.amendmentTags ?? [],
      MAX_GENERATION_HISTORY
    ),
    updatedAt: server.updatedAt,
  };
}

export async function getGenerationTopicHistory(
  userId: string
): Promise<GenerationTopicHistory> {
  const redis = getRedis();
  if (!redis) return emptyHistory();

  try {
    const raw = await redis.get<string>(historyKey(userId));
    if (!raw) return emptyHistory();

    if (typeof raw === "string") {
      return normalizeHistory(JSON.parse(raw) as Partial<GenerationTopicHistory>);
    }

    return normalizeHistory(raw as Partial<GenerationTopicHistory>);
  } catch {
    return emptyHistory();
  }
}

export async function recordGenerationTopics(
  userId: string,
  input: GenerationHistoryInput
): Promise<GenerationTopicHistory> {
  const redis = getRedis();
  const existing = await getGenerationTopicHistory(userId);

  const next: GenerationTopicHistory = {
    topicIds: mergeUniqueTail(existing.topicIds, input.topicIds ?? []),
    scenarioTitles: mergeUniqueTail(existing.scenarioTitles, input.titles ?? []),
    scenarioIds: mergeUniqueTail(existing.scenarioIds, input.scenarioIds ?? []),
    amendmentTags: mergeUniqueTail(
      existing.amendmentTags,
      input.amendmentTags ?? []
    ),
    updatedAt: new Date().toISOString(),
  };

  if (!redis) return next;

  try {
    await redis.set(historyKey(userId), JSON.stringify(next), {
      ex: HISTORY_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Failed to record generation topic history:", error);
  }

  return next;
}