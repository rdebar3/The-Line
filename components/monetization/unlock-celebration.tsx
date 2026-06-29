"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHARACTER_NAME } from "@/lib/guardian";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

export function UnlockCelebration() {
  const { justUnlocked, clearUnlockCelebration } = useSubscription();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!justUnlocked) return;

    const timer = window.setTimeout(() => {
      setIsExiting(true);
      window.setTimeout(() => {
        clearUnlockCelebration();
        setIsExiting(false);
      }, 400);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [justUnlocked, clearUnlockCelebration]);

  function dismiss() {
    setIsExiting(true);
    window.setTimeout(() => {
      clearUnlockCelebration();
      setIsExiting(false);
    }, 400);
  }

  if (!justUnlocked) return null;

  return (
    <div
      className={cn(
        "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 w-[calc(100%-2rem)] max-w-sm",
        isExiting ? "animate-fade-out" : "animate-fade-up"
      )}
    >
      <div className="rounded-xl border border-gold/30 bg-navy-elevated/95 p-4 shadow-[0_8px_40px_rgba(201,162,39,0.2)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10">
            <Sparkles className="size-4 text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold text-gold">
              Full Experience Unlocked
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {CHARACTER_NAME} training, all scenarios, the Arsenal, and
              unlimited passages are now yours. Hold the line.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}