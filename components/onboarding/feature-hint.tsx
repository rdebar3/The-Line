"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Lightbulb, X } from "lucide-react";

import {
  hasSeenFeatureHint,
  markFeatureHintSeen,
  type OnboardingHintId,
} from "@/lib/onboarding-experience";
import { cn } from "@/lib/utils";

type FeatureHintProps = {
  hintId: OnboardingHintId;
  title: string;
  message: string;
  children: ReactNode;
  className?: string;
};

export function FeatureHint({
  hintId,
  title,
  message,
  children,
  className,
}: FeatureHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasSeenFeatureHint(hintId)) return;

    const timer = window.setTimeout(() => setVisible(true), 700);
    return () => window.clearTimeout(timer);
  }, [hintId]);

  function dismiss() {
    markFeatureHintSeen(hintId);
    setVisible(false);
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative transition-shadow duration-500",
          visible &&
            "rounded-2xl shadow-[0_0_0_2px_rgba(201,162,39,0.45),0_0_32px_rgba(201,162,39,0.12)]"
        )}
      >
        {children}
      </div>

      {visible && (
        <div
          role="status"
          className="mt-4 animate-fade-up rounded-xl border border-gold/30 bg-navy-elevated/95 p-4 shadow-[0_8px_32px_rgba(10,15,28,0.45)]"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
              <Lightbulb className="size-4 text-gold" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-semibold text-foreground">
                {title}
              </p>
              <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 text-sm font-semibold text-gold transition-colors hover:text-gold-bright"
              >
                Got it
              </button>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss tip"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-navy/60 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}