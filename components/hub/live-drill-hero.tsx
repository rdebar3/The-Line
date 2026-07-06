"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Lock, Radio } from "lucide-react";

import { HeroBackground } from "@/components/hub/hero-cinematic/hero-background";
import { Button } from "@/components/ui/button";
import { useMidnightCountdown } from "@/hooks/use-midnight-countdown";
import { useSubscription } from "@/hooks/use-subscription";
import {
  canTakeDailyDrill,
  FREE_DAILY_DRILL_LIMIT,
  readDailyDrillState,
  recordDailyDrill,
} from "@/lib/daily-drill-limit";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  buildQuickDrillExplanation,
  buildQuickDrillPrompt,
  pickRandomQuickDrill,
} from "@/lib/quick-drill-bank";
import type { Scenario } from "@/lib/scenarios";
import { UNLOCK_CTA_LABEL } from "@/lib/subscription";
import { cn } from "@/lib/utils";

function DailyLimitReached({
  onUpgrade,
}: {
  onUpgrade: () => void;
}) {
  const countdown = useMidnightCountdown();

  return (
    <div className="live-drill-limit rounded-2xl border border-gold/25 bg-navy/45 px-4 py-5 text-center sm:px-6 sm:py-6">
      <p className="font-heading text-base font-bold tracking-wide text-foreground sm:text-lg">
        You&apos;ve held the line today.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Training resets at midnight.
      </p>
      <p
        className="live-drill-countdown mt-4 font-mono text-2xl font-bold tracking-wider text-gold tabular-nums sm:text-3xl"
        aria-live="polite"
      >
        {countdown}
      </p>
      <Button
        onClick={onUpgrade}
        className="btn-gold btn-cta mt-5 h-12 w-full max-w-sm rounded-xl font-semibold shadow-[0_0_28px_rgba(201,162,39,0.25)]"
      >
        <Lock className="size-4 shrink-0" />
        {UNLOCK_CTA_LABEL}
      </Button>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Unlock unlimited daily drills and full tactical training.
      </p>
    </div>
  );
}

function LiveDrillWidget({
  authLoaded,
  isSignedIn,
  isPremium,
  isGuest,
  onUpgrade,
}: {
  authLoaded: boolean;
  isSignedIn: boolean;
  isPremium: boolean;
  isGuest: boolean;
  onUpgrade: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [drillsCompleted, setDrillsCompleted] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!authLoaded) {
      setReady(false);
      return;
    }

    const state = readDailyDrillState();
    setDrillsCompleted(state.drillsCompleted);
    setSelected(null);

    if (!canTakeDailyDrill(isPremium)) {
      setLimitReached(true);
      setScenario(null);
      setReady(true);
      return;
    }

    setLimitReached(false);
    setScenario(pickRandomQuickDrill());
    setReady(true);
  }, [authLoaded, isPremium, isSignedIn]);

  if (!ready) {
    return (
      <div
        className="live-drill-panel rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-2xl sm:p-6"
        aria-hidden
      >
        <div className="h-40 animate-pulse rounded-xl bg-navy/40" />
      </div>
    );
  }

  if (limitReached && !isPremium) {
    return <DailyLimitReached onUpgrade={onUpgrade} />;
  }

  if (!scenario) {
    return null;
  }

  const answered = selected !== null;
  const wasCorrect = selected === scenario.correctChoiceId;
  const drillsUsedAfterAnswer = drillsCompleted + (answered ? 1 : 0);

  function handleSelect(choiceId: string) {
    if (answered) return;

    setSelected(choiceId);

    if (!isPremium) {
      const next = recordDailyDrill(false);
      setDrillsCompleted(next.drillsCompleted);

      if (next.drillsCompleted >= FREE_DAILY_DRILL_LIMIT) {
        setLimitReached(true);
      }
    }
  }

  return (
    <div className="live-drill-panel rounded-2xl border border-white/20 bg-white/[0.1] p-4 backdrop-blur-2xl sm:p-5">
      <div className="live-drill-eyebrow mb-3 inline-flex items-center gap-2 font-mono text-[0.58rem] font-semibold tracking-[0.24em] text-gold uppercase sm:text-xs">
        <span className="live-drill-live" />
        <Radio className="size-3 text-crimson-hover" />
        <span>Live Drill</span>
      </div>

      <p className="text-pretty text-sm leading-relaxed text-foreground sm:text-base">
        {buildQuickDrillPrompt(scenario)}
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {scenario.choices.map((choice) => {
          const isSelected = selected === choice.id;
          const isCorrect = choice.id === scenario.correctChoiceId;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(choice.id)}
              className={cn(
                "live-drill-choice min-h-12 w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-colors duration-200",
                !answered &&
                  "border-navy-border/80 bg-navy-elevated/60 hover:border-gold/35 hover:bg-navy-elevated/90",
                answered &&
                  isCorrect &&
                  "live-drill-correct border-emerald-500/50 bg-emerald-500/15 text-foreground",
                answered &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-500/50 bg-red-500/15 text-foreground",
                answered &&
                  !isSelected &&
                  !isCorrect &&
                  "border-navy-border/50 text-muted-foreground"
              )}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {answered && selected !== null && (
        <div
          className={cn(
            "live-drill-explanation mt-4 space-y-4 rounded-xl border px-4 py-4",
            wasCorrect
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          )}
        >
          <p className="text-pretty text-sm leading-relaxed text-foreground/95">
            <span className="font-semibold text-gold">{CHARACTER_NAME}:</span>{" "}
            {buildQuickDrillExplanation(scenario, wasCorrect)}
          </p>

          {!isPremium && (
            <p className="text-sm font-medium text-muted-foreground">
              That was {drillsUsedAfterAnswer} of your {FREE_DAILY_DRILL_LIMIT}{" "}
              free daily drills
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            <Button
              nativeButton={false}
              render={<Link href="/quick-drills" />}
              className="btn-crimson btn-cta h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_24px_rgba(185,28,28,0.25)]"
            >
              Continue Training
              <ArrowRight className="size-4 shrink-0" />
            </Button>

            {isGuest && (
              <Link
                href="/sign-up"
                className="text-center text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                Create free account to track your Defender Score.
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveDrillHero() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isPremium, openUnlockModal } = useSubscription();
  const isGuest = !authLoaded || !isSignedIn;

  return (
    <header className="hub-live-drill-hero relative isolate w-full overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="live-drill-title font-heading font-black leading-none tracking-[0.02em]">
            <span className="live-drill-title-pre">The</span>
            <span className="live-drill-title-main">Line</span>
          </h1>
          <p className="live-drill-tagline mt-2 text-sm font-bold text-foreground sm:text-base">
            Know the standard. Hold the line.
          </p>
        </div>

        <div className="mx-auto mt-5 max-w-xl sm:mt-6">
          <LiveDrillWidget
            authLoaded={authLoaded}
            isSignedIn={Boolean(isSignedIn)}
            isPremium={isPremium}
            isGuest={isGuest}
            onUpgrade={openUnlockModal}
          />
        </div>
      </div>
    </header>
  );
}