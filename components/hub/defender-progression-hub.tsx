"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Flame, Shield, Target, TrendingUp, Zap } from "lucide-react";

import { MasteryTracksPanel } from "@/components/progression/mastery-tracks-panel";
import { GrokProgressionPanel } from "@/components/progression/grok-progression-panel";
import { WeeklyChallengeCard } from "@/components/hub/weekly-challenge-card";
import { PromotionOrders } from "@/components/progression/promotion-orders";
import { RankBadge } from "@/components/progression/rank-badge";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { cn } from "@/lib/utils";

export function DefenderProgressionHub() {
  const { isPremium } = useSubscription();
  const {
    isLoaded,
    defenderScore,
    dailyStreak,
    correctStreak,
    rank,
    nextRank,
    rankProgress,
    dailyMission,
    logHubActivity,
  } = useProgression();

  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [barWidth, setBarWidth] = useState(0);
  const [missionJustCompleted, setMissionJustCompleted] = useState(false);
  const prevScoreRef = useRef(defenderScore);
  const prevMissionCompletedRef = useRef(false);
  const hubActivityLoggedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || hubActivityLoggedRef.current) return;
    hubActivityLoggedRef.current = true;
    logHubActivity();
  }, [isLoaded, logHubActivity]);

  useEffect(() => {
    if (defenderScore > prevScoreRef.current) {
      setScoreDelta(defenderScore - prevScoreRef.current);
      const timer = window.setTimeout(() => setScoreDelta(null), 2500);
      prevScoreRef.current = defenderScore;
      return () => window.clearTimeout(timer);
    }
    prevScoreRef.current = defenderScore;
  }, [defenderScore]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBarWidth(rankProgress.progress);
    });
    return () => cancelAnimationFrame(frame);
  }, [rankProgress.progress]);

  useEffect(() => {
    if (dailyMission?.completed && !prevMissionCompletedRef.current) {
      setMissionJustCompleted(true);
      const timer = window.setTimeout(() => setMissionJustCompleted(false), 3000);
      prevMissionCompletedRef.current = true;
      return () => window.clearTimeout(timer);
    }
    if (!dailyMission?.completed) {
      prevMissionCompletedRef.current = false;
    }
  }, [dailyMission?.completed]);

  if (!isLoaded) {
    return (
      <div className="animate-pulse rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-navy-border/40" />
        <div className="mx-auto mt-4 h-4 w-48 rounded bg-navy-border/40" />
        <div className="mx-auto mt-6 h-3 w-full max-w-md rounded-full bg-navy-border/30" />
      </div>
    );
  }

  const missionPercent = dailyMission
    ? Math.min(
        100,
        Math.round((dailyMission.progress / dailyMission.target) * 100)
      )
    : 0;

  const trainingLabel = (() => {
    if (dailyMission && !dailyMission.completed) {
      return `Continue Training — ${dailyMission.progress}/${dailyMission.target} Mission`;
    }
    if (isPremium) {
      return "Enter Training — Rights Under Pressure";
    }
    return `Start Training — ${FREE_DAILY_SCENARIO_GENERATION_LIMIT} Free Scenarios/Day`;
  })();

  return (
    <div className="hub-card-shell shadow-[0_0_60px_rgba(201,162,39,0.08)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,162,39,0.1)_0%,transparent_55%)]"
      />
      <div aria-hidden className="hub-card-accent" />

      <div className="relative p-4 sm:p-8">
        <header className="hub-section-header sm:mb-8">
          <h2 className="section-eyebrow">Your Progress</h2>
          <p className="hub-section-subtitle">
            Score, streaks, and mastery — everything you&apos;ve earned on the
            line.
          </p>
        </header>

        <PromotionOrders />

        <div className="mb-6 sm:mb-8">
          <WeeklyChallengeCard />
        </div>

        <div className="mb-6 sm:mb-8">
          <MasteryTracksPanel />
        </div>

        {/* Defender score hero */}
        <div className="mb-6 rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/[0.08] to-navy/50 p-5 text-center shadow-[0_0_40px_rgba(201,162,39,0.08)] sm:mb-8 sm:p-6">
          <p className="font-heading text-[0.65rem] font-semibold tracking-[0.3em] text-gold uppercase">
            Defender Score
          </p>
          <p
            aria-live="polite"
            className={cn(
              "score-glow mt-2 font-heading text-5xl font-bold text-foreground transition-transform duration-300 sm:text-6xl lg:text-7xl",
              scoreDelta !== null && "score-pulse"
            )}
          >
            {defenderScore.toLocaleString()}
          </p>
          {scoreDelta !== null && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold animate-in fade-in duration-300">
              <Zap className="size-3.5" />
              +{scoreDelta} pts
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Earned from training, missions & streaks
          </p>
        </div>

        <div className="mb-6 grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8 sm:mb-8">
          <div className="flex justify-center">
            <RankBadge rank={rank} size="lg" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border border-crimson/30 bg-gradient-to-b from-crimson/10 to-crimson/5 p-4 text-center shadow-[0_4px_24px_rgba(185,28,28,0.08)] sm:p-5">
                <p className="flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-crimson uppercase">
                  <Flame className="size-4" />
                  Daily Streak
                </p>
                <p className="mt-2 font-heading text-4xl font-bold text-foreground">
                  {dailyStreak}
                  <span className="ml-0.5 text-lg font-medium text-muted-foreground">
                    days
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-gold/25 bg-gradient-to-b from-gold/10 to-gold/5 p-4 text-center shadow-[0_4px_24px_rgba(201,162,39,0.08)] sm:p-5">
                <p className="flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.18em] text-gold uppercase">
                  <TrendingUp className="size-4" />
                  Answer Streak
                </p>
                <p className="mt-2 font-heading text-4xl font-bold text-foreground">
                  {correctStreak}
                  <span className="ml-1 text-lg font-medium text-muted-foreground">
                    in a row
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 sm:p-5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-heading text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
                  {rankProgress.isMaxRank
                    ? "Maximum Rank Achieved"
                    : `Next: ${nextRank?.title}`}
                </span>
                {!rankProgress.isMaxRank && (
                  <span className="text-xs font-medium text-gold">
                    {rankProgress.pointsToNext} pts to {nextRank?.abbreviation}
                  </span>
                )}
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-navy-border/60 bg-navy/60">
                <div
                  className="progress-bar-gold h-full rounded-full"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              {!rankProgress.isMaxRank && (
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {rankProgress.progress}% toward promotion
                </p>
              )}
            </div>
          </div>
        </div>

        {dailyMission && (
          <div
            className={cn(
              "mb-6 rounded-2xl border p-4 transition-all duration-500 sm:mb-8 sm:p-5",
              dailyMission.completed
                ? "border-gold/35 bg-gradient-to-r from-gold/10 to-gold/5 shadow-[0_0_30px_rgba(201,162,39,0.12)]"
                : "border-navy-border/80 bg-navy/50",
              missionJustCompleted && "shadow-[0_0_40px_rgba(201,162,39,0.2)]"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl border",
                    dailyMission.completed
                      ? "border-gold/35 bg-gold/15 shadow-[0_0_16px_rgba(201,162,39,0.2)]"
                      : "border-crimson/35 bg-crimson/10"
                  )}
                >
                  {dailyMission.completed ? (
                    <CheckCircle2 className="size-6 text-gold" />
                  ) : (
                    <Target className="size-6 text-crimson" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
                    Daily Mission
                  </p>
                  <p className="mt-1 font-heading text-base font-bold text-foreground sm:text-lg">
                    {dailyMission.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dailyMission.description}
                  </p>
                </div>
              </div>
              <div className="w-full sm:min-w-[160px] sm:text-right">
                {dailyMission.completed ? (
                  <p className="flex items-center justify-end gap-1.5 font-heading text-sm font-bold tracking-wide text-gold uppercase">
                    <Shield className="size-4" />
                    Complete
                  </p>
                ) : (
                  <p className="font-heading text-lg font-bold text-foreground">
                    {dailyMission.progress}
                    <span className="text-muted-foreground">
                      /{dailyMission.target}
                    </span>
                  </p>
                )}
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-navy-border/50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      dailyMission.completed
                        ? "progress-bar-gold"
                        : "bg-gradient-to-r from-crimson to-crimson-hover"
                    )}
                    style={{ width: `${missionPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-gold">
                  +{dailyMission.reward} pts on completion
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="btn-crimson btn-cta w-full max-w-md rounded-xl sm:w-auto"
          >
            {trainingLabel}
          </Button>
        </div>

        <div className="mt-8 border-t border-navy-border/50 pt-7 sm:pt-8">
          <GrokProgressionPanel />
        </div>
      </div>
    </div>
  );
}