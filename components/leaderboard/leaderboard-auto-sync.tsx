"use client";

import { useLeaderboardSync } from "@/hooks/use-leaderboard-sync";
import { useProgression } from "@/hooks/use-progression";

/** Keeps signed-in users enrolled on the leaderboard even off the home page. */
export function LeaderboardAutoSync() {
  const { defenderScore, isLoaded } = useProgression();
  useLeaderboardSync(defenderScore, isLoaded);
  return null;
}