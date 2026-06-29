import { Redis } from "@upstash/redis";

const LEADERBOARD_KEY = "theline:leaderboard";
const PROFILE_PREFIX = "theline:profile:";
const USERNAME_PREFIX = "theline:username:";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
};

export type LeaderboardMe = {
  rank: number;
  score: number;
  username: string | null;
  totalPlayers: number;
};

export type LeaderboardSyncResult = {
  rank: number;
  totalPlayers: number;
  rankDelta: number | null;
  username: string | null;
  hasUsername: boolean;
};

type UserProfile = {
  username: string | null;
  lastRank: number | null;
};

let redisClient: Redis | null = null;

export function isLeaderboardConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function getRedis(): Redis {
  if (!isLeaderboardConfigured()) {
    throw new Error("Leaderboard storage is not configured.");
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}

function profileKey(userId: string) {
  return `${PROFILE_PREFIX}${userId}`;
}

function usernameKey(username: string) {
  return `${USERNAME_PREFIX}${username.toLowerCase()}`;
}

async function readProfile(userId: string): Promise<UserProfile> {
  const redis = getRedis();
  const profile = await redis.hgetall<{
    username?: string;
    lastRank?: string;
  }>(profileKey(userId));

  return {
    username: profile?.username ?? null,
    lastRank: profile?.lastRank ? Number(profile.lastRank) : null,
  };
}

async function writeProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const redis = getRedis();
  const payload: Record<string, string> = {};

  if (updates.username !== undefined) {
    payload.username = updates.username ?? "";
  }
  if (updates.lastRank !== undefined) {
    payload.lastRank = updates.lastRank === null ? "" : String(updates.lastRank);
  }

  if (Object.keys(payload).length > 0) {
    await redis.hset(profileKey(userId), payload);
  }
}

export async function getRankForScore(
  userId: string,
  score: number
): Promise<number> {
  const redis = getRedis();
  const higherCount = await redis.zcount(
    LEADERBOARD_KEY,
    `(${score}`,
    "+inf"
  );
  return higherCount + 1;
}

export async function getTotalPlayers(): Promise<number> {
  const redis = getRedis();
  return redis.zcard(LEADERBOARD_KEY);
}

function applyCompetitionRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  let displayRank = 1;

  return entries.map((entry, index) => {
    if (index > 0 && entry.score < entries[index - 1]!.score) {
      displayRank = index + 1;
    }

    return {
      ...entry,
      rank: displayRank,
    };
  });
}

export function formatLeaderboardDisplayName(
  username: string | null
): string | null {
  return username || null;
}

export async function getTopEntries(limit = 10): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  const rows = await redis.zrange(LEADERBOARD_KEY, 0, 99, {
    rev: true,
    withScores: true,
  });

  const entries: LeaderboardEntry[] = [];

  for (let index = 0; index < rows.length; index += 2) {
    const userId = String(rows[index]);
    const score = Number(rows[index + 1]);
    const profile = await readProfile(userId);
    const displayName = formatLeaderboardDisplayName(profile.username);

    if (!displayName) continue;

    entries.push({
      rank: entries.length + 1,
      userId,
      username: displayName,
      score,
    });

    if (entries.length >= limit) break;
  }

  return applyCompetitionRanks(entries);
}

export async function getLeaderboardForUser(
  userId: string
): Promise<{ top10: LeaderboardEntry[]; me: LeaderboardMe | null }> {
  const redis = getRedis();
  const top10 = await getTopEntries(10);
  const totalPlayers = await getTotalPlayers();
  const score = await redis.zscore(LEADERBOARD_KEY, userId);

  if (score === null) {
    const profile = await readProfile(userId);
    return {
      top10,
      me: {
        rank: totalPlayers + 1,
        score: 0,
        username: profile.username,
        totalPlayers,
      },
    };
  }

  const numericScore = Number(score);
  const profile = await readProfile(userId);

  return {
    top10,
    me: {
      rank: await getRankForScore(userId, numericScore),
      score: numericScore,
      username: profile.username,
      totalPlayers,
    },
  };
}

export async function syncUserScore(
  userId: string,
  defenderScore: number,
  options: { checkIn?: boolean } = {}
): Promise<LeaderboardSyncResult> {
  const redis = getRedis();
  const sanitizedScore = Math.max(0, Math.floor(defenderScore));

  const currentScore = await redis.zscore(LEADERBOARD_KEY, userId);
  const storedScore =
    currentScore === null ? 0 : Math.max(0, Math.floor(Number(currentScore)));
  const scoreToStore = Math.max(storedScore, sanitizedScore);

  if (scoreToStore > storedScore || currentScore === null) {
    await redis.zadd(LEADERBOARD_KEY, {
      score: scoreToStore,
      member: userId,
    });
  }

  const profile = await readProfile(userId);
  const rank = await getRankForScore(userId, scoreToStore);
  const totalPlayers = await getTotalPlayers();

  let rankDelta: number | null = null;

  if (options.checkIn && profile.lastRank !== null) {
    rankDelta = profile.lastRank - rank;
  }

  if (options.checkIn) {
    await writeProfile(userId, { lastRank: rank });
  }

  return {
    rank,
    totalPlayers,
    rankDelta,
    username: profile.username,
    hasUsername: Boolean(profile.username),
  };
}

export async function removeUserFromLeaderboard(userId: string): Promise<void> {
  const redis = getRedis();
  const profile = await readProfile(userId);

  await redis.zrem(LEADERBOARD_KEY, userId);
  await redis.del(profileKey(userId));

  if (profile.username) {
    await redis.del(usernameKey(profile.username));
  }
}

export async function setUsername(
  userId: string,
  username: string
): Promise<{ username: string }> {
  const redis = getRedis();
  const normalized = username.trim();
  const key = usernameKey(normalized);
  const existingOwner = await redis.get<string>(key);

  if (existingOwner && existingOwner !== userId) {
    throw new Error("That username is already taken.");
  }

  const profile = await readProfile(userId);
  if (profile.username && profile.username.toLowerCase() !== normalized.toLowerCase()) {
    await redis.del(usernameKey(profile.username));
  }

  await redis.set(key, userId);
  await writeProfile(userId, { username: normalized });

  return { username: normalized };
}