"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import {
  canGenerateNextScenario,
  canStartGrokSession,
  getRemainingScenarioGenerations,
  readScenarioGenerationState,
  type ScenarioGenerationState,
} from "@/lib/scenario-generation";

const EMPTY_STATE: ScenarioGenerationState = {
  date: "",
  scenariosGenerated: 0,
  sessionsStarted: 0,
  recentTopicIds: [],
  recentScenarioTitles: [],
};

export function useScenarioGeneration(isPremium: boolean) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [state, setState] = useState<ScenarioGenerationState>(EMPTY_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setState(readScenarioGenerationState());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoaded) {
      setIsLoaded(false);
      return;
    }
    refresh();
  }, [refresh, authLoaded, isSignedIn, userId]);

  const remaining = isPremium
    ? Infinity
    : getRemainingScenarioGenerations(isPremium, state.scenariosGenerated);

  const canGenerate = canStartGrokSession(isPremium);
  const canGenerateNext = canGenerateNextScenario(
    isPremium,
    state.scenariosGenerated
  );

  return {
    isLoaded,
    state,
    remaining,
    canGenerate,
    canGenerateNext,
    refresh,
  };
}