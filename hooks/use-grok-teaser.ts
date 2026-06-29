"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo, useState } from "react";

import {
  FREE_GROK_DAILY_LIMIT,
  consumeGrokTeaserUse,
  getGrokTeaserRemaining,
  markGrokTeaserLimitReached,
  readGrokTeaserState,
} from "@/lib/grok-teaser";

export function useGrokTeaser() {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [revision, setRevision] = useState(0);

  const uses = useMemo(
    () => {
      if (!authLoaded) return 0;
      return readGrokTeaserState().uses;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revision + auth re-read user-scoped storage
    [authLoaded, isSignedIn, userId, revision]
  );

  const remaining = getGrokTeaserRemaining(uses);
  const canUseTeaser = remaining > 0;
  const isLoaded = authLoaded;

  const refresh = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const recordTeaserUse = useCallback(() => {
    const result = consumeGrokTeaserUse();
    setRevision((current) => current + 1);
    return result;
  }, []);

  const markLimitReached = useCallback(() => {
    markGrokTeaserLimitReached();
    setRevision((current) => current + 1);
  }, []);

  return {
    isLoaded,
    uses,
    remaining,
    limit: FREE_GROK_DAILY_LIMIT,
    canUseTeaser,
    recordTeaserUse,
    markLimitReached,
    refresh,
  };
}