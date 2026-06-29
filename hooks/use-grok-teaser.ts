"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import {
  FREE_GROK_DAILY_LIMIT,
  consumeGrokTeaserUse,
  getGrokTeaserRemaining,
  markGrokTeaserLimitReached,
  readGrokTeaserState,
} from "@/lib/grok-teaser";

export function useGrokTeaser() {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [uses, setUses] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    const state = readGrokTeaserState();
    setUses(state.uses);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoaded) {
      setIsLoaded(false);
      return;
    }
    refresh();
  }, [refresh, authLoaded, isSignedIn, userId]);

  const remaining = getGrokTeaserRemaining(uses);
  const canUseTeaser = remaining > 0;

  const useTeaser = useCallback(() => {
    const result = consumeGrokTeaserUse();
    setUses(result.uses);
    return result;
  }, []);

  const markLimitReached = useCallback(() => {
    const state = markGrokTeaserLimitReached();
    setUses(state.uses);
  }, []);

  return {
    isLoaded,
    uses,
    remaining,
    limit: FREE_GROK_DAILY_LIMIT,
    canUseTeaser,
    useTeaser,
    markLimitReached,
    refresh,
  };
}