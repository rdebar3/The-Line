"use client";

import { useMemo } from "react";

import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import { useProgression } from "@/hooks/use-progression";
import { getAllCertificationProgress } from "@/lib/certifications";
import {
  computeLivingOathEvolution,
  type LivingOathEvolution,
} from "@/lib/living-oath";

export function useLivingOath(): {
  evolution: LivingOathEvolution;
  isLoaded: boolean;
  defenderScore: number;
  savedLinesCount: number;
  certificationsEarned: number;
  dailyStreak: number;
} {
  const {
    state,
    isLoaded: progressionLoaded,
    defenderScore,
    dailyStreak,
    longestStreak,
  } = useProgression();
  const { count: savedLinesCount, isLoaded: linesLoaded } = useSavedLines();

  const certificationsEarned = useMemo(() => {
    if (!state) return 0;
    return getAllCertificationProgress(state).filter((item) => item.earned).length;
  }, [state]);

  const isLoaded = progressionLoaded && linesLoaded;

  const evolution = useMemo(
    () =>
      computeLivingOathEvolution({
        defenderScore,
        savedLinesCount,
        certificationsEarned,
        dailyStreak,
        longestStreak,
      }),
    [
      certificationsEarned,
      dailyStreak,
      defenderScore,
      longestStreak,
      savedLinesCount,
    ]
  );

  return {
    evolution,
    isLoaded,
    defenderScore,
    savedLinesCount,
    certificationsEarned,
    dailyStreak,
  };
}