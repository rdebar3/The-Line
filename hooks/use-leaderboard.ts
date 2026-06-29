"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

export type LeaderboardRow = {
  rank: number;
  username: string;
  score: number;
  isYou?: boolean;
};

export type LeaderboardMe = {
  rank: number;
  score: number;
  username: string | null;
  totalPlayers: number;
};

type LeaderboardResponse = {
  configured: boolean;
  top10: LeaderboardRow[];
  me: LeaderboardMe | null;
  isSignedIn?: boolean;
};

type SyncResponse = {
  rank: number;
  totalPlayers: number;
  rankDelta: number | null;
  username: string | null;
  hasUsername: boolean;
};

const CHECK_IN_KEY = "theline_leaderboard_checkin";

export function useLeaderboard(defenderScore: number, isProgressionLoaded: boolean) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankDelta, setRankDelta] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const lastSyncedScore = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      const payload = (await response.json()) as LeaderboardResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load leaderboard.");
      }

      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncScore = useCallback(
    async (score: number, checkIn = false) => {
      if (!isSignedIn) return null;

      setSyncing(true);

      try {
        const response = await fetch("/api/leaderboard/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ defenderScore: score, checkIn }),
        });

        const payload = (await response.json()) as SyncResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to sync score.");
        }

        if (checkIn && payload.rankDelta !== null) {
          setRankDelta(payload.rankDelta);
        }

        await refresh();
        return payload;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to sync score.");
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [isSignedIn, refresh]
  );

  const saveUsername = useCallback(
    async (username: string) => {
      const response = await fetch("/api/leaderboard/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const payload = (await response.json()) as { username?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save username.");
      }

      await refresh();
      return payload.username ?? username;
    },
    [refresh]
  );

  useEffect(() => {
    if (!isSignedIn && typeof window !== "undefined") {
      sessionStorage.removeItem(CHECK_IN_KEY);
      lastSyncedScore.current = null;
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh, isSignedIn]);

  useEffect(() => {
    if (!authLoaded || !isProgressionLoaded || !isSignedIn) return;
    if (lastSyncedScore.current === defenderScore) return;

    const shouldCheckIn =
      typeof window !== "undefined" &&
      sessionStorage.getItem(CHECK_IN_KEY) !== "1";

    void syncScore(defenderScore, shouldCheckIn).then(() => {
      if (shouldCheckIn && typeof window !== "undefined") {
        sessionStorage.setItem(CHECK_IN_KEY, "1");
      }
      lastSyncedScore.current = defenderScore;
    });
  }, [
    authLoaded,
    isProgressionLoaded,
    isSignedIn,
    defenderScore,
    syncScore,
  ]);

  const dismissRankDelta = useCallback(() => {
    setRankDelta(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    syncing,
    rankDelta,
    dismissRankDelta,
    refresh,
    saveUsername,
    syncScore,
  };
}