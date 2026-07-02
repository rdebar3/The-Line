"use client";

import { Sparkles } from "lucide-react";

import {
  getFocusProgress,
  getOverallMasteryCategories,
  getSessionFocusProgress,
  getTopicDifficultyLevel,
  getTopicStats,
  TOPIC_DIFFICULTY_LABELS,
  type TopicDifficultyLevel,
} from "@/lib/training-focus";
import type { ProgressionState } from "@/lib/progression";
import type { Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

type AnswerRecord = {
  scenarioId: string;
  choiceId: string;
  correct: boolean;
};

function TopicDifficultyBadge({ level }: { level: TopicDifficultyLevel }) {
  const meta = TOPIC_DIFFICULTY_LABELS[level];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-wide uppercase",
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

function OverallMasteryBar({
  progressionState,
}: {
  progressionState: ProgressionState | null | undefined;
}) {
  const categories = getOverallMasteryCategories(progressionState);

  return (
    <div className="rounded-xl border border-navy-border/50 bg-navy/30 px-3 py-3 sm:px-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <div key={category.id} className="min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-[0.65rem]">
              <span className="truncate font-medium text-muted-foreground">
                {category.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground/80">
                {category.total > 0 ? (
                  <>
                    <span className="text-foreground/90">{category.accuracy}%</span>
                    <span className="mx-1 text-navy-border">·</span>
                    {category.correct}/{category.total}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-navy-border/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  category.accuracy >= 80
                    ? "bg-gold"
                    : category.accuracy >= 60
                      ? "bg-gold/70"
                      : category.total > 0
                        ? "bg-crimson/70"
                        : "bg-navy-border/60"
                )}
                style={{
                  width: `${category.total > 0 ? Math.max(category.accuracy, 6) : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrainingFocusHeader({
  focusLabel,
  progressionState,
  sessionScenarios = [],
  answers = [],
  defenderScore,
  pointsEarned,
  correctStreak,
  generated = false,
  loading = false,
}: {
  focusLabel: string;
  progressionState: ProgressionState | null | undefined;
  sessionScenarios?: Scenario[];
  answers?: AnswerRecord[];
  defenderScore: number;
  pointsEarned: number | null;
  correctStreak: number;
  generated?: boolean;
  loading?: boolean;
}) {
  const topicStats = getTopicStats(progressionState, focusLabel);
  const focusProgress = getFocusProgress(topicStats);
  const sessionFocus = getSessionFocusProgress(
    sessionScenarios,
    answers,
    focusLabel
  );
  const difficultyLevel = getTopicDifficultyLevel(topicStats);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
              Current Focus
            </p>
            {generated && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[0.6rem] font-medium tracking-wide text-gold">
                <Sparkles className="size-3" />
                Grok
              </span>
            )}
            {loading && (
              <span className="rounded-full border border-navy-border/70 bg-navy/50 px-2 py-0.5 text-[0.6rem] font-medium text-muted-foreground">
                Composing…
              </span>
            )}
          </div>

          <h1 className="text-balance font-heading text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl lg:text-[2rem]">
            {focusLabel || "Rights Under Pressure"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {focusProgress.completed} of {focusProgress.target}
              </span>{" "}
              completed on this topic
              {sessionFocus.total > 1 && (
                <span className="text-muted-foreground/80">
                  {" "}
                  · {sessionFocus.completed}/{sessionFocus.total} this session
                </span>
              )}
            </p>
            <TopicDifficultyBadge level={difficultyLevel} />
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end lg:min-w-[9rem]">
          <div className="rounded-xl border border-gold/20 bg-navy-elevated/70 px-4 py-2.5 text-center sm:min-w-[8.5rem] sm:py-3">
            <p className="text-[0.6rem] font-semibold tracking-[0.22em] text-gold uppercase">
              Score
            </p>
            <p className="score-glow font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {defenderScore.toLocaleString()}
            </p>
            {pointsEarned !== null && pointsEarned > 0 && (
              <p className="mt-0.5 text-xs font-medium text-gold">
                +{pointsEarned} pts
              </p>
            )}
          </div>
          {correctStreak > 0 && (
            <p className="text-xs font-medium tracking-wide text-gold">
              {correctStreak} streak
            </p>
          )}
        </div>
      </div>

      <OverallMasteryBar progressionState={progressionState} />
    </div>
  );
}