import { Redis } from "@upstash/redis";

import { isLeaderboardConfigured } from "@/lib/leaderboard";

const SQUAD_PREFIX = "theline:squad:";
const SQUAD_CODE_PREFIX = "theline:squadcode:";

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!isLeaderboardConfigured()) {
    throw new Error("Squad storage is not configured.");
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export type Squad = {
  id: string;
  name: string;
  code: string;
  memberIds: string[];
  combinedScore: number;
};

export async function createSquad(
  userId: string,
  name: string
): Promise<Squad> {
  const redis = getRedis();
  const id = `squad_${Date.now()}`;
  let code = generateCode();
  while (await redis.get(`${SQUAD_CODE_PREFIX}${code}`)) {
    code = generateCode();
  }

  const squad: Squad = {
    id,
    name: name.trim().slice(0, 40) || "Platoon",
    code,
    memberIds: [userId],
    combinedScore: 0,
  };

  await redis.set(`${SQUAD_CODE_PREFIX}${code}`, id);
  await redis.hset(`${SQUAD_PREFIX}${id}`, {
    name: squad.name,
    code,
    memberIds: JSON.stringify(squad.memberIds),
    combinedScore: "0",
  });

  return squad;
}

export async function joinSquad(
  userId: string,
  code: string
): Promise<Squad | null> {
  const redis = getRedis();
  const squadId = await redis.get<string>(`${SQUAD_CODE_PREFIX}${code.toUpperCase()}`);
  if (!squadId) return null;

  const raw = await redis.hgetall<{
    name?: string;
    code?: string;
    memberIds?: string;
    combinedScore?: string;
  }>(`${SQUAD_PREFIX}${squadId}`);

  if (!raw?.name) return null;

  const memberIds = JSON.parse(raw.memberIds ?? "[]") as string[];
  if (!memberIds.includes(userId)) memberIds.push(userId);

  await redis.hset(`${SQUAD_PREFIX}${squadId}`, {
    memberIds: JSON.stringify(memberIds),
  });

  return {
    id: squadId,
    name: raw.name,
    code: raw.code ?? code,
    memberIds,
    combinedScore: Number(raw.combinedScore ?? 0),
  };
}

export async function getSquad(squadId: string): Promise<Squad | null> {
  const redis = getRedis();
  const raw = await redis.hgetall<{
    name?: string;
    code?: string;
    memberIds?: string;
    combinedScore?: string;
  }>(`${SQUAD_PREFIX}${squadId}`);

  if (!raw?.name) return null;

  const memberIds = JSON.parse(raw.memberIds ?? "[]") as string[];
  let combinedScore = Number(raw.combinedScore ?? 0);
  const hasMemberScores = memberIds.some(
    (memberId) => raw[`memberScore:${memberId}` as keyof typeof raw] !== undefined
  );
  if (hasMemberScores) {
    combinedScore = memberIds.reduce(
      (sum, memberId) =>
        sum + Number(raw[`memberScore:${memberId}` as keyof typeof raw] ?? 0),
      0
    );
  }

  return {
    id: squadId,
    name: raw.name,
    code: raw.code ?? "",
    memberIds,
    combinedScore,
  };
}

export async function syncMemberSquadScore(
  squadId: string,
  userId: string,
  defenderScore: number
): Promise<void> {
  const squad = await getSquad(squadId);
  if (!squad) return;

  const redis = getRedis();
  const key = `${SQUAD_PREFIX}${squadId}`;
  await redis.hset(key, {
    [`memberScore:${userId}`]: String(Math.max(0, Math.floor(defenderScore))),
  });

  const raw = await redis.hgetall<Record<string, string>>(key);
  if (!raw) return;

  let combinedScore = 0;
  for (const memberId of squad.memberIds) {
    combinedScore += Number(raw[`memberScore:${memberId}`] ?? 0);
  }

  await redis.hset(key, { combinedScore: String(combinedScore) });
}