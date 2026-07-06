"use client";

import { useEffect, useState } from "react";

import {
  formatMidnightCountdown,
  getMillisecondsUntilMidnight,
} from "@/lib/daily-drill-limit";

export function useMidnightCountdown(active = true) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getMillisecondsUntilMidnight()
  );

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      setRemainingMs(getMillisecondsUntilMidnight());
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [active]);

  return formatMidnightCountdown(remainingMs);
}