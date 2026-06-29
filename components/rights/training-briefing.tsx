"use client";

import {
  AlertTriangle,
  Loader2,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
} from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { RankBadge } from "@/components/progression/rank-badge";
import { Button } from "@/components/ui/button";
import { CHARACTER_NAME } from "@/lib/guardian";
import type { MilitaryRank } from "@/lib/progression";
import {
  DIFFICULTY_LABELS,
  FREE_DAILY_SCENARIO_GENERATION_LIMIT,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";
import { cn } from "@/lib/utils";

type TrainingBriefingProps = {
  rank: MilitaryRank;
  difficulty: ScenarioDifficulty;
  weakAreas: { amendment: string; accuracy: number }[];
  remainingGenerations: number;
  isPremium: boolean;
  canGenerate: boolean;
  isDeploying: boolean;
  onDeploy: () => void;
  onUpgrade?: () => void;
};

export function TrainingBriefing({
  rank,
  difficulty,
  weakAreas,
  remainingGenerations,
  isPremium,
  canGenerate,
  isDeploying,
  onDeploy,
  onUpgrade,
}: TrainingBriefingProps) {
  const difficultyMeta = DIFFICULTY_LABELS[difficulty];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.35em] text-crimson uppercase">
            Training Briefing
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Rights Under Pressure
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {CHARACTER_NAME} teaches the full founding corpus every round —
            direct questions from the text, key ideas, and practical
            applications. Not every item is a dramatic scenario; the goal is
            high-quality learning you can use in real life.
          </p>
        </div>
        <RankBadge rank={rank} size="lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gold/25 bg-gold/5 p-4">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
            <Target className="size-3.5" />
            Difficulty
          </p>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">
            {difficultyMeta.label}
          </p>
          <span
            className={cn(
              "mt-2 inline-flex rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
              difficulty === "easy" && "border-gold/30 bg-gold/10 text-gold",
              difficulty === "medium" &&
                "border-crimson/30 bg-crimson/10 text-crimson",
              difficulty === "hard" &&
                "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light"
            )}
          >
            {difficultyMeta.badge}
          </span>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {difficultyMeta.subtitle}
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-4">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <Swords className="size-3.5" />
            Session Type
          </p>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">
            Dynamic
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Cumulative training across Declaration, Constitution, Bill of
            Rights, and core principles — one fresh scenario per round
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-4">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <TrendingUp className="size-3.5" />
            Rank Scaling
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {rank.title} ({rank.abbreviation}) sets exercise intensity — Private
            through Sergeant get foundational drills; Lieutenants+ face
            command-level complexity.
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-4">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <Sparkles className="size-3.5 text-gold" />
            Grok Quota
          </p>
          {isPremium ? (
            <p className="mt-2 font-heading text-lg font-semibold text-gold">
              Unlimited
            </p>
          ) : (
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {remainingGenerations}
              <span className="text-base font-medium text-muted-foreground">
                /{FREE_DAILY_SCENARIO_GENERATION_LIMIT}
              </span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {isPremium
              ? "Personalized sessions on demand"
              : "New scenarios remaining today"}
          </p>
        </div>
      </div>

      {weakAreas.length > 0 && (
        <div className="rounded-xl border border-crimson/20 bg-crimson/5 p-5">
          <p className="font-heading text-xs font-semibold tracking-[0.2em] text-crimson uppercase">
            Priority Targets
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {CHARACTER_NAME} will weight these areas across the full document
            corpus — not amendments alone:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakAreas.slice(0, 4).map((area) => (
              <span
                key={area.amendment}
                className="rounded-lg border border-crimson/25 bg-navy/50 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                {area.amendment} · {Math.round(area.accuracy * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-navy-elevated/60 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <GuardianCharacter mood="thinking" size="lg" floating showLabel />
          <div className="flex-1">
            <p className="font-heading text-sm font-semibold tracking-[0.2em] text-gold uppercase">
              Mission Orders
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Deploy for your first question. Each round teaches from the
              Declaration, Constitution, Bill of Rights, or core principles —
              as a passage quiz, key idea, or practical application. End the
              session when you are ready for results.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={onDeploy}
            disabled={!canGenerate || isDeploying}
            className="btn-crimson min-h-12 w-full max-w-sm rounded-xl text-base font-semibold"
          >
            {isDeploying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {CHARACTER_NAME} is composing your first scenario...
              </>
            ) : (
              <>
                <Swords className="size-4" />
                Deploy Training Session
              </>
            )}
          </Button>
        </div>

        {!canGenerate && !isPremium && (
          <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-center">
            <div className="mb-2 flex justify-center">
              <AlertTriangle className="size-5 text-gold" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Daily Grok generation limit reached
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Free defenders get {FREE_DAILY_SCENARIO_GENERATION_LIMIT} fresh
              scenarios per day. Unlock for unlimited, rank-personalized
              sessions.
            </p>
            {onUpgrade && (
              <Button onClick={onUpgrade} className="btn-gold mt-4">
                Unlock Full Experience
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}