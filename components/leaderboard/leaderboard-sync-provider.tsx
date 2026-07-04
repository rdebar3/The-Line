"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useLeaderboardSync } from "@/hooks/use-leaderboard-sync";
import { useProgression } from "@/hooks/use-progression";

type LeaderboardSyncContextValue = {
  rankDelta: number | null;
  dismissRankDelta: () => void;
};

const LeaderboardSyncContext = createContext<LeaderboardSyncContextValue>({
  rankDelta: null,
  dismissRankDelta: () => {},
});

export function LeaderboardSyncProvider({ children }: { children: ReactNode }) {
  const { defenderScore, isLoaded } = useProgression();
  const { rankDelta, dismissRankDelta } = useLeaderboardSync(
    defenderScore,
    isLoaded
  );

  return (
    <LeaderboardSyncContext.Provider value={{ rankDelta, dismissRankDelta }}>
      {children}
    </LeaderboardSyncContext.Provider>
  );
}

export function useLeaderboardSyncState() {
  return useContext(LeaderboardSyncContext);
}