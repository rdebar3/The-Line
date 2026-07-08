"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { PREMIUM_PRICE_LABEL } from "@/lib/subscription";
import type { TrialState } from "@/lib/trial";

const DISMISS_KEY = "theline_trial_banner_dismissed";

/**
 * Floating trial status pill. Shows days remaining on the 7-day full-access
 * trial with a one-tap path to the $4.99 unlock. Dismissible per session.
 */
export function TrialBanner({
  trial,
  isPremium,
  onUnlock,
}: {
  trial: TrialState;
  isPremium: boolean;
  onUnlock: () => void;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (isPremium || !trial.active || dismissed) return null;

  const daysLabel =
    trial.daysRemaining === 1 ? "Last day" : `${trial.daysRemaining} days left`;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex max-w-full items-center gap-3 rounded-full border border-gold/30 bg-navy/90 py-2 pl-4 pr-2 shadow-[0_8px_32px_rgba(4,6,12,0.6),0_0_24px_rgba(201,162,39,0.12)] backdrop-blur-xl">
        <Sparkles className="size-4 shrink-0 text-gold" />
        <p className="truncate text-xs font-medium text-foreground sm:text-sm">
          <span className="font-semibold text-gold">Full-access trial</span>
          <span className="text-muted-foreground"> · {daysLabel}</span>
        </p>
        <button
          type="button"
          onClick={onUnlock}
          className="shrink-0 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
        >
          Keep it — {PREMIUM_PRICE_LABEL} once
        </button>
        <button
          type="button"
          aria-label="Dismiss trial banner"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "true");
            setDismissed(true);
          }}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
