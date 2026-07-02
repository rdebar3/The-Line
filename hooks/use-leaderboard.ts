"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

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
  displayName: string | null;
  totalPlayers: number;
  isDefaultUsername: boolean;
};

type LeaderboardResponse = {
  configured: boolean;
  entries: LeaderboardRow[];
  pinnedMe: LeaderboardRow | null;
  me: LeaderboardMe | null;
  isSignedIn?: boolean;
};

export function useLeaderboard(defenderScore: number, isProgressionLoaded: boolean) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
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
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

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
    void refresh();
  }, [refresh, isSignedIn]);

  useEffect(() => {
    if (!authLoaded || !isProgressionLoaded || !isSignedIn) return;
    void refresh({ silent: true });
  }, [authLoaded, defenderScore, isProgressionLoaded, isSignedIn, refresh]);

  useEffect(() => {
    function handleSynced() {
      void refresh({ silent: true });
    }

    function handleReturn() {
      void refresh({ silent: true });
    }

    window.addEventListener("theline:leaderboard-synced", handleSynced);
    window.addEventListener("pageshow", handleReturn);
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleReturn();
      }
    });

    return () => {
      window.removeEventListener("theline:leaderboard-synced", handleSynced);
      window.removeEventListener("pageshow", handleReturn);
      window.removeEventListener("focus", handleReturn);
    };
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
    saveUsername,
  };
}