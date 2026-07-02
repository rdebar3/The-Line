import { Redis } from "@upstash/redis";

import {
  DEFAULT_USERNAME_FALLBACK,
  formatLeaderboardDisplayName,
  generatePatriotCallsign,
  isDefaultLeaderboardUsername,
} from "@/lib/leaderboard-username";

const LEADERBOARD_KEY = "theline:leaderboard";
const PROFILE_PREFIX = "theline:profile:";
const USERNAME_PREFIX = "theline:username:";

/** Number of all-time defenders shown on the main scoreboard. */
export const LEADERBOARD_DISPLAY_LIMIT = 50;

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
  displayName: string | null;
  totalPlayers: number;
  isDefaultUsername: boolean;
};

export type LeaderboardSyncResult = {
  rank: number;
  totalPlayers: number;
  rankDelta: number | null;
  username: string | null;
  displayName: string | null;
  hasUsername: boolean;
  isDefaultUsername: boolean;
};

type UserProfile = {
  username: string | null;
  lastRank: number | null;
  isDefaultUsername: boolean;
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
    isDefaultUsername?: string;
  }>(profileKey(userId));

  const username = profile?.username?.trim() || null;

  return {
    username,
    lastRank: profile?.lastRank ? Number(profile.lastRank) : null,
    isDefaultUsername:
      profile?.isDefaultUsername === "1" ||
      (username !== null && isDefaultLeaderboardUsername(username)),
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
  if (updates.isDefaultUsername !== undefined) {
    payload.isDefaultUsername = updates.isDefaultUsername ? "1" : "0";
  }

  if (Object.keys(payload).length > 0) {
    await redis.hset(profileKey(userId), payload);
  }
}

async function isUsernameAvailable(username: string): Promise<boolean> {
  const redis = getRedis();
  const existingOwner = await redis.get<string>(usernameKey(username));
  return !existingOwner;
}

async function claimUsername(
  userId: string,
  username: string,
  isDefault: boolean
): Promise<string> {
  const redis = getRedis();
  const key = usernameKey(username);
  await redis.set(key, userId);
  await writeProfile(userId, { username, isDefaultUsername: isDefault });
  return username;
}

export async function ensureDefaultUsername(userId: string): Promise<string> {
  const profile = await readProfile(userId);
  if (profile.username) {
    return profile.username;
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generatePatriotCallsign();
    if (await isUsernameAvailable(candidate)) {
      return claimUsername(userId, candidate, true);
    }
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const digits = String(Math.floor(100000 + Math.random() * 900000));
    const candidate = `Patriot-${digits}`;
    if (await isUsernameAvailable(candidate)) {
      return claimUsername(userId, candidate, true);
    }
  }

  const fallbackDigits = String(Math.floor(1000 + Math.random() * 9000));
  const fallback = `${DEFAULT_USERNAME_FALLBACK}_${fallbackDigits}`;
  if (await isUsernameAvailable(fallback)) {
    return claimUsername(userId, fallback, true);
  }

  const lastResort = `${DEFAULT_USERNAME_FALLBACK}_${Date.now().toString().slice(-6)}`;
  return claimUsername(userId, lastResort, true);
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

async function getUserEntry(userId: string): Promise<LeaderboardEntry | null> {
  const redis = getRedis();
  const score = await redis.zscore(LEADERBOARD_KEY, userId);
  if (score === null) return null;

  const profile = await readProfile(userId);
  const rawUsername = profile.username ?? (await ensureDefaultUsername(userId));
  const numericScore = Number(score);

  return {
    rank: await getRankForScore(userId, numericScore),
    userId,
    username: formatLeaderboardDisplayName(rawUsername),
    score: numericScore,
  };
}

export async function getTopEntries(
  limit = LEADERBOARD_DISPLAY_LIMIT
): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  const rows = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, {
    rev: true,
    withScores: true,
  });

  const entries: LeaderboardEntry[] = [];

  for (let index = 0; index < rows.length; index += 2) {
    const userId = String(rows[index]);
    const score = Number(rows[index + 1]);
    const profile = await readProfile(userId);
    const rawUsername = profile.username ?? (await ensureDefaultUsername(userId));
    const displayName = formatLeaderboardDisplayName(rawUsername);

    entries.push({
      rank: entries.length + 1,
      userId,
      username: displayName,
      score,
    });
  }

  return applyCompetitionRanks(entries);
}

export async function getLeaderboardForUser(
  userId: string,
  limit = LEADERBOARD_DISPLAY_LIMIT
): Promise<{
  entries: LeaderboardEntry[];
  pinnedMe: LeaderboardEntry | null;
  me: LeaderboardMe | null;
}> {
  const redis = getRedis();
  const entries = await getTopEntries(limit);
  const totalPlayers = await getTotalPlayers();
  const score = await redis.zscore(LEADERBOARD_KEY, userId);

  if (score === null) {
    const profile = await readProfile(userId);
    const username = profile.username;
    return {
      entries,
      pinnedMe: null,
      me: {
        rank: totalPlayers + 1,
        score: 0,
        username,
        displayName: username ? formatLeaderboardDisplayName(username) : null,
        totalPlayers,
        isDefaultUsername: profile.isDefaultUsername,
      },
    };
  }

  const numericScore = Number(score);
  const profile = await readProfile(userId);
  const username =
    profile.username ?? (await ensureDefaultUsername(userId));
  const userInList = entries.some((entry) => entry.userId === userId);
  const pinnedMe = userInList ? null : await getUserEntry(userId);

  return {
    entries,
    pinnedMe,
    me: {
      rank: await getRankForScore(userId, numericScore),
      score: numericScore,
      username,
      displayName: formatLeaderboardDisplayName(username),
      totalPlayers,
      isDefaultUsername: profile.isDefaultUsername,
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

  const username = await ensureDefaultUsername(userId);
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
    username,
    displayName: formatLeaderboardDisplayName(username),
    hasUsername: true,
    isDefaultUsername: profile.isDefaultUsername,
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
  await writeProfile(userId, {
    username: normalized,
    isDefaultUsername: false,
  });

  return { username: normalized };
}