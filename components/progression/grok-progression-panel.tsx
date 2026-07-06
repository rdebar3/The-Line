"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { FeatureHint } from "@/components/onboarding/feature-hint";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { UNLOCK_CTA_LABEL } from "@/lib/subscription";
import {
  getWeakestDrillTarget,
  type GrokMissionPayload,
} from "@/lib/grok-progression";
import {
  buildPerformanceSummary,
  getWeakAreas,
  type GrokMission,
} from "@/lib/progression";
import { cn } from "@/lib/utils";

function GrokMissionCard({
  mission,
  pointsEarned,
  onComplete,
  onDismiss,
}: {
  mission: GrokMission;
  pointsEarned: number | null;
  onComplete: (missionId: string, choiceId: string) => void;
  onDismiss?: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null || mission.completed;
  const wasCorrect = selected === mission.correctChoiceId;

  return (
    <div className="overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-navy/55">
      <div className="border-b border-gold/15 bg-gold/[0.04] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <p className="min-w-0 font-heading text-sm font-semibold leading-snug tracking-wide text-balance text-gold sm:text-[0.95rem]">
            {mission.title}
          </p>
          <span className="w-fit max-w-full shrink-0 rounded-md border border-gold/25 bg-navy/50 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.1em] text-gold/85 uppercase">
            {mission.focusArea}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {mission.scenario}
        </p>

        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.15em] text-balance text-foreground uppercase">
            {mission.question}
          </p>
          <div className="mt-3 grid gap-2.5">
            {mission.choices.map((choice) => {
              const isSelected = selected === choice.id;
              const isCorrect = choice.id === mission.correctChoiceId;

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={answered}
                  onClick={() => {
                    setSelected(choice.id);
                    onComplete(mission.id, choice.id);
                  }}
                  className={cn(
                    "min-h-11 rounded-xl border px-3.5 py-3 text-left text-sm leading-snug transition-all sm:px-4",
                    "break-words text-pretty",
                    !answered &&
                      "border-navy-border/80 bg-navy-elevated/50 hover:border-gold/30 hover:bg-navy-elevated/80",
                    answered &&
                      isCorrect &&
                      "border-gold/40 bg-gold/10 text-foreground",
                    answered &&
                      isSelected &&
                      !isCorrect &&
                      "border-crimson/40 bg-crimson/10 text-foreground",
                    answered &&
                      !isSelected &&
                      !isCorrect &&
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

        {answered && selected !== null && (
          <div
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 space-y-3 rounded-xl border px-4 py-4 duration-300",
              wasCorrect
                ? "border-gold/35 bg-gold/10"
                : "border-crimson/35 bg-crimson/10"
            )}
          >
            <div className="flex items-center gap-2">
              {wasCorrect ? (
                <CheckCircle2 className="size-5 shrink-0 text-gold" />
              ) : (
                <XCircle className="size-5 shrink-0 text-crimson" />
              )}
              <p
                className={cn(
                  "font-heading text-sm font-semibold tracking-wide uppercase",
                  wasCorrect ? "text-gold" : "text-crimson"
                )}
              >
                {wasCorrect ? "Correct" : "Incorrect"}
              </p>
              {pointsEarned !== null && pointsEarned > 0 && (
                <span className="ml-auto text-sm font-semibold text-gold">
                  +{pointsEarned} pts
                </span>
              )}
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {mission.explanation}
            </p>
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="outline"
                size="sm"
                className="h-10 w-full rounded-xl border-navy-border/80 bg-navy/50 hover:border-gold/30 hover:bg-navy-elevated/80"
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LockedTrainingGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
      <GuardianCharacter mood="neutral" size="md" floating showLabel />

      <div className="mt-5 w-full max-w-md rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.08] to-navy/50 px-5 py-5 sm:px-6 sm:py-6">
        <p className="font-heading text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
          {CHARACTER_NAME} · Mission Briefing
        </p>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/90">
          Personalized drills, weak-area targeting, and rank debriefs are Full
          Access capabilities.
        </p>
        <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
          Unlock once to receive unlimited field orders from your training
          officer.
        </p>
      </div>

      <Button
        onClick={onUnlock}
        className="btn-gold btn-cta mt-6 h-12 w-full max-w-sm rounded-xl font-semibold shadow-[0_0_28px_rgba(201,162,39,0.25)]"
      >
        <Sparkles className="size-4 shrink-0" />
        {UNLOCK_CTA_LABEL}
      </Button>
    </div>
  );
}

export function GrokProgressionPanel() {
  const { isLoading: subscriptionLoading, openUnlockModal, canAccess } =
    useSubscription();
  const { state, grokMissions, saveGrokMission, finishGrokMission } =
    useProgression();

  const [loadingAction, setLoadingAction] = useState<
    "next_mission" | "personalized_scenario" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMissionType, setLastMissionType] = useState<string | null>(null);
  const [missionPoints, setMissionPoints] = useState<Record<string, number>>({});
  const [reviewMissionId, setReviewMissionId] = useState<string | null>(null);

  const canUseGrok = canAccess("grok_progression");
  const showLocked = !subscriptionLoading && !canUseGrok;

  const weakestTarget = useMemo(
    () => (state ? getWeakestDrillTarget(state) : null),
    [state]
  );

  async function requestGrokMission(
    action: "next_mission" | "personalized_scenario"
  ) {
    if (!canUseGrok) {
      openUnlockModal();
      return;
    }

    if (!state) return;

    if (action === "personalized_scenario" && !weakestTarget) {
      setError(
        "Complete a few training scenarios first so we can identify your weakest area."
      );
      return;
    }

    setLoadingAction(action);
    setError(null);

    try {
      const response = await fetch("/api/grok/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          performanceSummary: buildPerformanceSummary(state),
          focusArea:
            action === "personalized_scenario"
              ? weakestTarget?.focusArea
              : undefined,
          defenderScore: state.defenderScore,
          weakAreas: getWeakAreas(state.weakAreas).map((area) => area.amendment),
          sessionSeed: Date.now(),
        }),
      });

      const data = (await response.json()) as {
        mission?: GrokMissionPayload;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate mission.");
      }

      if (data.mission) {
        setReviewMissionId(null);
        saveGrokMission(data.mission);
        setLastMissionType(
          action === "next_mission"
            ? `General mission deployed — ${data.mission.focusArea}`
            : `Weak area drill — ${data.mission.focusArea}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleMissionComplete(missionId: string, choiceId: string) {
    const mission = grokMissions.find((item) => item.id === missionId);
    if (!mission) return;
    setReviewMissionId(missionId);
    const result = finishGrokMission(
      missionId,
      choiceId === mission.correctChoiceId
    );
    if (result && result.pointsEarned > 0) {
      setMissionPoints((previous) => ({
        ...previous,
        [missionId]: result.pointsEarned,
      }));
    }
  }

  const activeMissions = grokMissions.filter((mission) => !mission.completed);
  const completedCount = grokMissions.filter((mission) => mission.completed).length;

  const displayedMissions = useMemo(() => {
    if (reviewMissionId) {
      const reviewMission = grokMissions.find(
        (mission) => mission.id === reviewMissionId
      );
      if (reviewMission) return [reviewMission];
    }
    return activeMissions.slice(0, 2);
  }, [reviewMissionId, grokMissions, activeMissions]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-navy/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,162,39,0.1)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <GuardianCharacter mood="neutral" size="sm" className="-mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="section-eyebrow !text-[0.65rem] sm:!text-xs">
                Tactical Training
              </p>
              {showLocked && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.12em] text-gold uppercase">
                  <Lock className="size-2.5" />
                  Full Access
                </span>
              )}
            </div>
            <h3 className="mt-1 font-heading text-lg font-bold tracking-wide text-foreground sm:text-xl">
              Quick Drills
            </h3>
            <p className="mt-1.5 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
              {showLocked
                ? `${CHARACTER_NAME} issues short missions from the hub — unlock for general drills, weak-area targeting, and rank debriefs.`
                : `${CHARACTER_NAME} issues two kinds of hub drills: general missions across any topic, or focused remedial drills on your weakest area.`}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-navy-border/60 bg-navy/30 sm:mt-6">
          {showLocked ? (
            <LockedTrainingGate onUnlock={openUnlockModal} />
          ) : (
            <div className="p-4 sm:p-5">
              {displayedMissions.length > 0 ? (
                <div className="space-y-4">
                  {!reviewMissionId && (
                    <p className="font-heading text-xs font-semibold tracking-[0.2em] text-crimson uppercase">
                      Active Mission
                    </p>
                  )}
                  {displayedMissions.map((mission) => (
                    <GrokMissionCard
                      key={mission.id}
                      mission={mission}
                      pointsEarned={missionPoints[mission.id] ?? null}
                      onComplete={handleMissionComplete}
                      onDismiss={
                        reviewMissionId === mission.id
                          ? () => setReviewMissionId(null)
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-gold/20 bg-navy/25 px-5 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
                    <Target className="size-5 text-gold" />
                  </div>
                  <p className="mt-4 font-heading text-sm font-semibold tracking-[0.1em] text-balance text-foreground uppercase">
                    Awaiting Mission Orders
                  </p>
                  <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                    <strong className="font-medium text-foreground">Next Mission</strong>{" "}
                    — random constitutional topic for general training.{" "}
                    <strong className="font-medium text-gold">Weak Area Drill</strong>{" "}
                    — focused remedial mission on your lowest-accuracy topic.
                  </p>
                </div>
              )}

              {lastMissionType && !error && displayedMissions.length === 0 && (
                <p className="mt-4 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-foreground/90">
                  {lastMissionType}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-crimson">
                  {error}
                </p>
              )}

              <FeatureHint
                hintId="quick_drills"
                title="Quick Drills — how they work"
                message="Next Mission covers a random topic for general practice. Weak Area Drill targets your lowest-accuracy topic once you've completed a few training sessions."
              >
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Button
                      disabled={
                        loadingAction !== null || reviewMissionId !== null
                      }
                      onClick={() => void requestGrokMission("next_mission")}
                      className="btn-crimson btn-cta h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_24px_rgba(185,28,28,0.25)]"
                    >
                      {loadingAction === "next_mission" ? (
                        <Loader2 className="size-4 shrink-0 animate-spin" />
                      ) : (
                        <Target className="size-4 shrink-0" />
                      )}
                      {loadingAction === "next_mission"
                        ? "Deploying…"
                        : "Next Mission"}
                    </Button>
                    <p className="text-center text-[0.65rem] leading-relaxed text-muted-foreground sm:text-left">
                      Random topic · repeatable general training
                    </p>
                  </div>

                  <div className="space-y-2">
                    {weakestTarget ? (
                      <p className="rounded-lg border border-gold/20 bg-gold/5 px-2.5 py-1.5 text-center text-[0.65rem] leading-snug text-gold sm:text-left">
                        Targeting your weakest area:{" "}
                        <span className="font-semibold text-foreground">
                          {weakestTarget.displayLabel}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          ({weakestTarget.accuracy}% accuracy)
                        </span>
                      </p>
                    ) : (
                      <p className="rounded-lg border border-navy-border/60 bg-navy/40 px-2.5 py-1.5 text-center text-[0.65rem] text-muted-foreground sm:text-left">
                        Complete training to unlock weak-area targeting
                      </p>
                    )}
                    <Button
                      disabled={
                        loadingAction !== null ||
                        reviewMissionId !== null ||
                        !weakestTarget
                      }
                      onClick={() =>
                        void requestGrokMission("personalized_scenario")
                      }
                      className="btn-gold h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_24px_rgba(201,162,39,0.2)]"
                    >
                      {loadingAction === "personalized_scenario" ? (
                        <Loader2 className="size-4 shrink-0 animate-spin" />
                      ) : (
                        <Sparkles className="size-4 shrink-0" />
                      )}
                      {loadingAction === "personalized_scenario"
                        ? "Targeting…"
                        : "Weak Area Drill"}
                    </Button>
                    <p className="text-center text-[0.65rem] leading-relaxed text-muted-foreground sm:text-left">
                      Focused remedial drill on your lowest score
                    </p>
                  </div>
                </div>
              </FeatureHint>

              {completedCount > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-gold/15 bg-gold/5 px-4 py-2.5 text-xs text-muted-foreground sm:justify-start">
                  <CheckCircle2 className="size-3.5 shrink-0 text-gold" />
                  <span className="min-w-0 text-pretty">
                    <span className="font-semibold text-gold">{completedCount}</span>{" "}
                    {CHARACTER_NAME} mission{completedCount === 1 ? "" : "s"}{" "}
                    completed
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}