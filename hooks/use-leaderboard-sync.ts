"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

const CHECK_IN_KEY = "theline_leaderboard_checkin";

type SyncResponse = {
  rankDelta: number | null;
  error?: string;
};

export function useLeaderboardSync(
  defenderScore: number,
  isProgressionLoaded: boolean
) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const lastSyncedScore = useRef<number | null>(null);
  const [rankDelta, setRankDelta] = useState<number | null>(null);

  const syncScore = useCallback(
    async (score: number, checkIn = false) => {
      if (!isSignedIn) return null;

      try {
        const response = await fetch("/api/leaderboard/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ defenderScore: score, checkIn }),
        });

        const payload = (await response.json()) as SyncResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to sync score.");
        }

        if (checkIn && payload.rankDelta !== null) {
          setRankDelta(payload.rankDelta);
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("theline:leaderboard-synced"));
        }

        return payload;
      } catch {
        return null;
      }
    },
    [isSignedIn]
  );

  useEffect(() => {
    if (!isSignedIn && typeof window !== "undefined") {
      sessionStorage.removeItem(CHECK_IN_KEY);
      lastSyncedScore.current = null;
      setRankDelta(null);
    }
  }, [isSignedIn]);

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
    defenderScore,
    isProgressionLoaded,
    isSignedIn,
    syncScore,
  ]);

  const dismissRankDelta = useCallback(() => {
    setRankDelta(null);
  }, []);

  return { syncScore, rankDelta, dismissRankDelta };
}