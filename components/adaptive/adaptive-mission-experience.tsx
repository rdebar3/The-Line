"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import { useAdaptiveIntelligence } from "@/hooks/use-adaptive-intelligence";
import { useProgression } from "@/hooks/use-progression";
import { CHARACTER_NAME } from "@/lib/guardian";
import { cn } from "@/lib/utils";

type Phase = "mission" | "debrief" | "complete";

export function AdaptiveMissionExperience() {
  const router = useRouter();
  const {
    activeMission,
    requestDebrief,
    isLoaded: intelligenceLoaded,
  } = useAdaptiveIntelligence();
  const {
    isLoaded: progressionLoaded,
    answerAdaptiveScenario,
    completeAdaptiveMission,
    dismissAdaptiveMission,
    defenderScore,
    rank,
  } = useProgression();

  const [phase, setPhase] = useState<Phase>("mission");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [bonusAwarded, setBonusAwarded] = useState<number | null>(null);
  const [debrief, setDebrief] = useState<string | null>(null);
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = intelligenceLoaded && progressionLoaded;
  const mission = activeMission;

  const currentScenario = mission?.scenarios[activeIndex] ?? null;
  const answeredCount = mission?.scenarios.filter((s) => s.answered).length ?? 0;
  const totalCount = mission?.scenarios.length ?? 0;
  const progressPercent =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  useEffect(() => {
    if (!showFeedback || !mission) return;

    const timer = window.setTimeout(() => {
      if (activeIndex < mission.scenarios.length - 1) {
        setActiveIndex((index) => index + 1);
        setSelectedChoiceId(null);
        setLastPointsEarned(null);
        setShowFeedback(false);
      }
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [showFeedback, activeIndex, mission]);

  const handleAnswer = useCallback(
    (choiceId: string) => {
      if (!mission || !currentScenario || currentScenario.answered || showFeedback) {
        return;
      }

      setSelectedChoiceId(choiceId);
      const result = answerAdaptiveScenario(currentScenario.id, choiceId);
      if (!result) return;

      setLastPointsEarned(result.pointsEarned);
      setSessionPoints((prev) => prev + result.pointsEarned);
      setShowFeedback(true);

      if (result.missionComplete) {
        setError(null);

        window.setTimeout(() => {
          setPhase("debrief");
          setIsDebriefLoading(true);

          void (async () => {
            try {
              const results = mission.scenarios.map((scenario) => ({
                focusArea: scenario.focusArea,
                correct:
                  scenario.id === currentScenario.id
                    ? result.correct
                    : Boolean(scenario.correct),
              }));

              const missionDebrief = await requestDebrief(results);
              if (missionDebrief) {
                const finalized = completeAdaptiveMission(missionDebrief);
                setDebrief(missionDebrief);
                setBonusAwarded(finalized?.bonusAwarded ?? null);
                setPhase("complete");
              }
            } catch (err) {
              const fallback = `${CHARACTER_NAME} reports mission complete. You targeted ${mission.focusAreas.join(", ")} — keep drilling your weak areas to hold the constitutional line.`;
              const finalized = completeAdaptiveMission(fallback);
              setDebrief(fallback);
              setBonusAwarded(finalized?.bonusAwarded ?? null);
              setPhase("complete");
              setError(
                err instanceof Error
                  ? err.message
                  : "Debrief unavailable — mission still recorded."
              );
            } finally {
              setIsDebriefLoading(false);
            }
          })();
        }, 2200);
      }
    },
    [
      mission,
      currentScenario,
      showFeedback,
      answerAdaptiveScenario,
      requestDebrief,
      completeAdaptiveMission,
    ]
  );

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Loader2 className="size-10 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading personalized mission...
        </p>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <GuardianCharacter mood="thinking" size="lg" floating showLabel />
        <h1 className="mt-6 font-heading text-2xl font-bold tracking-wide text-foreground">
          No Active Mission
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Generate a personalized mission from Quick Drills on the hub.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/quick-drills" />}
          className="btn-gold mt-8 min-w-[220px]"
        >
          Open Quick Drills
        </Button>
      </div>
    );
  }

  if (phase === "debrief") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <Loader2 className="size-10 animate-spin text-gold" />
        <h1 className="mt-6 font-heading text-xl font-bold tracking-wide text-foreground">
          {CHARACTER_NAME} is preparing your debrief...
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Analyzing your weak-area performance across {totalCount} scenarios.
        </p>
      </div>
    );
  }

  if (phase === "complete") {
    const correctCount = mission.scenarios.filter((s) => s.correct).length;

    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-12 text-gold" />
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
            Mission Complete
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {correctCount}/{totalCount} correct · +{sessionPoints} session pts
            {bonusAwarded ? ` · +${bonusAwarded} weak-area bonus` : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/[0.08] to-navy/50 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:text-left">
            <GuardianCharacter mood="neutral" size="md" floating showLabel />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                {CHARACTER_NAME}&apos;s Debrief
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {debrief}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 text-center">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Defender Score
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {defenderScore.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 text-center">
            <p className="text-xs font-semibold tracking-wide text-gold uppercase">
              Rank
            </p>
            <p className="mt-2 font-heading text-xl font-bold text-foreground">
              {rank.title}
            </p>
            <p className="text-sm text-muted-foreground">{rank.abbreviation}</p>
          </div>
        </div>

        {error && (
          <p className="text-center text-xs text-muted-foreground">{error}</p>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              dismissAdaptiveMission();
              router.push("/quick-drills");
            }}
            className="btn-gold min-w-[200px]"
          >
            Return to Quick Drills
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            variant="outline"
            className="min-w-[200px] border-navy-border"
          >
            Continue Training
          </Button>
        </div>
      </div>
    );
  }

  if (!currentScenario) {
    return null;
  }

  const hasAnswered =
    currentScenario.answered || selectedChoiceId !== null || showFeedback;
  const wasCorrect =
    selectedChoiceId !== null
      ? selectedChoiceId === currentScenario.correctChoiceId
      : currentScenario.correct === true;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center sm:text-left">
        <p className="font-heading text-xs font-semibold tracking-[0.3em] text-gold uppercase">
          Personalized Mission
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
          {mission.title}
        </h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {mission.focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-md border border-gold/25 bg-gold/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-gold uppercase"
            >
              {area}
            </span>
          ))}
        </div>
      </header>

      <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-4">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Scenario {activeIndex + 1} of {totalCount}
          </span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-border/50">
          <div
            className="progress-bar-gold h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-navy-elevated/60">
        <div className="border-b border-gold/15 bg-gold/[0.04] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Target className="size-4 text-gold" />
            <p className="font-heading text-sm font-semibold text-gold">
              {currentScenario.focusArea}
            </p>
            <span className="text-xs text-muted-foreground">
              · Level {currentScenario.difficultyLevel}
            </span>
          </div>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">
            {currentScenario.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentScenario.sourceDocument}
          </p>
        </div>

        <div className="space-y-5 px-5 py-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {currentScenario.scenario}
          </p>

          <div>
            <p className="font-heading text-xs font-semibold tracking-[0.15em] text-foreground uppercase">
              {currentScenario.question}
            </p>
            <div className="mt-4 grid gap-3">
              {currentScenario.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                const isCorrectChoice =
                  choice.id === currentScenario.correctChoiceId;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(choice.id)}
                    className={cn(
                      "min-h-12 rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-all",
                      !hasAnswered &&
                        "border-navy-border/80 bg-navy/60 hover:border-gold/30 hover:bg-navy-elevated",
                      hasAnswered &&
                        isCorrectChoice &&
                        "border-gold/40 bg-gold/10 text-foreground",
                      hasAnswered &&
                        isSelected &&
                        !isCorrectChoice &&
                        "border-crimson/40 bg-crimson/10 text-foreground",
                      hasAnswered &&
                        !isSelected &&
                        !isCorrectChoice &&
                        "border-navy-border/50 text-muted-foreground"
                    )}
                  >
                    <span className="mr-2 font-heading font-semibold text-gold uppercase">
                      {choice.id}.
                    </span>
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasAnswered && (
            <div
              className={cn(
                "animate-in fade-in space-y-3 rounded-xl border px-4 py-4 duration-300",
                wasCorrect
                  ? "border-gold/35 bg-gold/10"
                  : "border-crimson/35 bg-crimson/10"
              )}
            >
              <div className="flex items-center gap-2">
                {wasCorrect ? (
                  <CheckCircle2 className="size-5 text-gold" />
                ) : (
                  <XCircle className="size-5 text-crimson" />
                )}
                <p className="font-heading text-sm font-semibold text-foreground">
                  {wasCorrect ? "Correct" : "Review"}
                  {lastPointsEarned !== null && (
                    <span className="ml-2 text-gold">+{lastPointsEarned} pts</span>
                  )}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {currentScenario.explanation}
              </p>
              {answeredCount < totalCount && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-gold">
                  <Sparkles className="size-3" />
                  Advancing to the next scenario...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}