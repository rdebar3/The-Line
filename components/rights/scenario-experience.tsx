"use client";

/**
 * ScenarioExperience — Rights Under Pressure, rebuilt.
 *
 * All session logic now lives in hooks/use-training-session.ts; this file
 * only renders. Phases hand off through AnimatePresence instead of hard
 * swaps, choices reveal with a stagger, and answer feedback is choreographed
 * (correct pulse / wrong shake via the .msn-* layer in app/cinematic.css).
 *
 * Every child component, API contract, and monetization gate is unchanged.
 */

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Loader2,
  Scale,
  Sparkles,
} from "lucide-react";

import { CertificationUnlockModal } from "@/components/certifications/certification-unlock-modal";
import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { EducationalDisclaimer } from "@/components/legal/educational-disclaimer";
import { DailyScenarioLimitModal } from "@/components/monetization/daily-scenario-limit-modal";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { SaveLineButton } from "@/components/my-lines/save-line-button";
import { RankBadge } from "@/components/progression/rank-badge";
import { FieldDebriefPanel } from "@/components/rights/field-debrief-panel";
import { GuardianReaction } from "@/components/rights/guardian-reaction";
import { PressureReplayDebrief } from "@/components/rights/pressure-replay-debrief";
import { SourceLinksPanel } from "@/components/rights/source-links-panel";
import { TrainingBriefing } from "@/components/rights/training-briefing";
import { TrainingFocusHeader } from "@/components/rights/training-focus-header";
import { FieldCardShare } from "@/components/share/field-card-share";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useTrainingSession,
  type TrainingSession,
} from "@/hooks/use-training-session";
import { getDocumentSlugFromSource } from "@/lib/document-links";
import { CHARACTER_NAME } from "@/lib/guardian";
import { SCENARIO_DISCLAIMER } from "@/lib/legal-disclaimers";
import {
  getSituationHeading,
  QUESTION_FORMAT_LABELS,
} from "@/lib/question-formats";
import { buildScenarioLineId } from "@/lib/saved-lines";
import {
  DIFFICULTY_LABELS,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";
import { getScenarioSourceDocument } from "@/lib/scenario-display";
import type { Scenario } from "@/lib/scenarios";
import { UNLOCK_FULL_LABEL } from "@/lib/subscription";
import { cn } from "@/lib/utils";

/* ── Motion presets ──────────────────────────────────────────────────── */

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PHASE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: EASE_OUT },
};

/* ── Small pieces ────────────────────────────────────────────────────── */

function DifficultyBadge({ difficulty }: { difficulty: ScenarioDifficulty }) {
  const meta = DIFFICULTY_LABELS[difficulty];
  return (
    <span
      className={cn(
        "rounded-lg border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.15em] uppercase",
        difficulty === "easy" && "border-gold/30 bg-gold/10 text-gold",
        difficulty === "medium" && "border-crimson/30 bg-crimson/10 text-crimson",
        difficulty === "hard" &&
          "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light"
      )}
    >
      {meta.badge} · {meta.label}
    </span>
  );
}

function StreakPips({ answers }: { answers: TrainingSession["answers"] }) {
  if (answers.length === 0) return null;
  const recent = answers.slice(-6);

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Session answers: ${answers.filter((a) => a.correct).length} of ${answers.length} correct`}
    >
      {recent.map((answer, index) => (
        <span
          key={`${answer.scenarioId}-${index}`}
          className={cn(
            "msn-streak-pip",
            answer.correct && "msn-streak-pip--lit"
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

/* ── Feedback (unchanged content, choreographed entrance) ────────────── */

function FeedbackPanel({
  scenario,
  selectedChoiceId,
}: {
  scenario: Scenario;
  selectedChoiceId: string;
}) {
  const isCorrect = selectedChoiceId === scenario.correctChoiceId;
  const correctChoice = scenario.choices.find(
    (choice) => choice.id === scenario.correctChoiceId
  );
  const lineToSave =
    scenario.rememberLine ??
    (isCorrect ? scenario.guardianPositive : scenario.guardianNegative);
  const documentSlug =
    scenario.documentSlug ?? getDocumentSlugFromSource(scenario.sourceDocument);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.15 }}
      className="space-y-5"
    >
      <div className="xl:hidden">
        <GuardianReaction
          mood={isCorrect ? "positive" : "negative"}
          message={
            isCorrect ? scenario.guardianPositive : scenario.guardianNegative
          }
        />
      </div>

      <div
        className={cn(
          "rounded-xl border px-5 py-4",
          isCorrect
            ? "border-gold/25 bg-gold/5"
            : "border-crimson/25 bg-crimson/5"
        )}
      >
        <p
          className={cn(
            "font-heading text-sm font-semibold tracking-wide",
            isCorrect ? "text-gold" : "text-crimson"
          )}
        >
          {isCorrect ? "Correct — line held" : "Not quite — line tested"}
        </p>
        {!isCorrect && correctChoice && (
          <p className="mt-2 text-sm text-foreground/90">
            The strongest answer:{" "}
            <span className="font-medium">{correctChoice.label}</span>
          </p>
        )}
        {!isCorrect && scenario.rememberLine && (
          <p className="mt-2 text-sm font-medium text-gold">
            Remember: {scenario.rememberLine}
          </p>
        )}
      </div>

      {lineToSave ? (
        <SaveLineButton
          draft={{
            id: buildScenarioLineId(scenario.id),
            source: "scenario",
            passageText: lineToSave,
            title: scenario.amendmentLabel,
            subtitle: scenario.title,
            documentSlug: documentSlug ?? undefined,
            passageId: scenario.passageIds?.[0],
            scenarioId: scenario.id,
          }}
        />
      ) : null}

      <SourceLinksPanel
        passageIds={scenario.passageIds}
        sourceDocument={scenario.sourceDocument}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <BookOpen className="size-4" />
            <h3 className="font-heading text-xs font-semibold tracking-[0.2em] uppercase">
              Historical Context
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {scenario.historicalContext}
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-crimson">
            <Scale className="size-4" />
            <h3 className="font-heading text-xs font-semibold tracking-[0.2em] uppercase">
              Modern Implication
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {scenario.modernImplication}
          </p>
        </div>
      </div>
      <EducationalDisclaimer className="pt-1" />
      <p className="text-[0.65rem] text-muted-foreground/70">
        {SCENARIO_DISCLAIMER}
      </p>
    </motion.div>
  );
}

/* ── Phase: generating ───────────────────────────────────────────────── */

function GeneratingPhase({ session }: { session: TrainingSession }) {
  return (
    <div className="space-y-8">
      <TrainingFocusHeader
        focusLabel={session.generatingFocusLabel}
        progressionState={session.progressionState}
        sessionScenarios={session.sessionScenarios}
        answers={session.answers}
        defenderScore={session.defenderScore}
        pointsEarned={null}
        correctStreak={0}
        loading
      />

      <Card className="premium-card rounded-2xl border-gold/25 py-0">
        <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="relative">
            <Loader2 className="size-12 animate-spin text-gold" />
            <span
              className="absolute inset-0 -z-10 rounded-full blur-xl"
              style={{ boxShadow: "0 0 48px 20px rgba(201,162,39,0.2)" }}
              aria-hidden
            />
          </div>
          <div className="max-w-md space-y-2">
            <p className="font-heading text-xl font-semibold tracking-wide text-foreground">
              {session.isFirstDeploy
                ? "Deploying Training Session"
                : "Generating Next Scenario"}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {CHARACTER_NAME} is composing a fresh, rank-scaled scenario from
              the full founding corpus. Stay on this screen — it will load
              automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Phase: training ─────────────────────────────────────────────────── */

function TrainingPhase({ session }: { session: TrainingSession }) {
  const reduceMotion = useReducedMotion();
  const scenario = session.scenario!;
  const {
    hasAnswered,
    selectedChoiceId,
    currentAnswer,
    canGenerateNext,
    isPremium,
    generationError,
  } = session;

  return (
    <div className="space-y-6 sm:space-y-8">
      <TrainingFocusHeader
        focusLabel={scenario.amendmentLabel}
        progressionState={session.progressionState}
        sessionScenarios={session.sessionScenarios}
        answers={session.answers}
        defenderScore={session.defenderScore}
        pointsEarned={session.lastPointsEarned}
        correctStreak={session.correctStreak}
        generated={scenario.generated}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="premium-card rounded-2xl py-0">
          <CardHeader className="gap-3 border-b border-navy-border/60 px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-navy-border/70 bg-navy/50 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                  {getScenarioSourceDocument(scenario)}
                </span>
                {scenario.questionFormat && (
                  <span className="rounded-md border border-navy-border/70 bg-navy/50 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                    {QUESTION_FORMAT_LABELS[scenario.questionFormat]}
                  </span>
                )}
              </div>
              <StreakPips answers={session.answers} />
            </div>
            <CardTitle className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              {scenario.title}
            </CardTitle>
            <div className="space-y-2">
              <p className="font-heading text-xs font-semibold tracking-[0.15em] text-gold uppercase">
                {getSituationHeading(scenario.questionFormat)}
              </p>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                {scenario.situation}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 py-8">
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
                {scenario.question}
              </h2>
              <div className="mt-4 grid gap-3">
                {scenario.choices.map((choice, index) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrectChoice =
                    choice.id === scenario.correctChoiceId;
                  const showResult = hasAnswered;

                  return (
                    <motion.button
                      key={choice.id}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => session.chooseAnswer(choice.id)}
                      initial={
                        reduceMotion ? undefined : { opacity: 0, y: 10 }
                      }
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 0.3,
                              delay: 0.08 * index,
                              ease: EASE_OUT,
                            }
                      }
                      className={cn(
                        "msn-choice",
                        showResult && isCorrectChoice && "msn-choice--correct",
                        showResult &&
                          isSelected &&
                          !isCorrectChoice &&
                          "msn-choice--wrong",
                        showResult &&
                          !isSelected &&
                          !isCorrectChoice &&
                          "msn-choice--dim"
                      )}
                    >
                      <span className="mr-3 font-heading font-semibold text-gold uppercase">
                        {choice.id}.
                      </span>
                      {choice.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {hasAnswered && selectedChoiceId && (
              <FeedbackPanel
                scenario={scenario}
                selectedChoiceId={selectedChoiceId}
              />
            )}

            {hasAnswered && (
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 border-t border-navy-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between"
              >
                {!canGenerateNext && !isPremium && (
                  <p className="text-xs text-muted-foreground">
                    Daily scenario limit reached — end session to view results.
                  </p>
                )}
                {generationError && (
                  <p className="text-sm text-crimson">{generationError}</p>
                )}
                <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
                  <Button
                    onClick={session.endSession}
                    variant="outline"
                    className="min-w-[160px] border-navy-border text-muted-foreground hover:text-foreground"
                  >
                    End Session
                  </Button>
                  <Button
                    onClick={() => void session.nextScenario()}
                    disabled={!canGenerateNext}
                    className="btn-gold min-w-[180px]"
                  >
                    Next Scenario
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <FieldDebriefPanel
          hasAnswered={hasAnswered}
          isCorrect={currentAnswer?.correct}
          feedbackMessage={
            hasAnswered
              ? currentAnswer?.correct
                ? scenario.guardianPositive
                : scenario.guardianNegative
              : undefined
          }
          awaitingMessage={
            session.sessionMeta.difficulty === "hard"
              ? "This is command-level pressure. Weigh the facts, identify the governing principle, then commit."
              : session.sessionMeta.difficulty === "medium"
                ? "Multiple principles may compete. Find the line the Constitution draws — not the line power prefers."
                : "Read the situation carefully. The Constitution gives you the standard — apply it before the pressure decides for you."
          }
        />
      </div>
    </div>
  );
}

/* ── Phase: complete ─────────────────────────────────────────────────── */

function CompletePhase({ session }: { session: TrainingSession }) {
  const correctCount = session.answers.filter((answer) => answer.correct).length;
  const difficultyMeta = DIFFICULTY_LABELS[session.sessionMeta.difficulty];

  return (
    <div className="space-y-8">
      <TrainingFocusHeader
        focusLabel={session.sessionFocusLabel}
        progressionState={session.progressionState}
        sessionScenarios={session.sessionScenarios}
        answers={session.answers}
        defenderScore={session.defenderScore}
        pointsEarned={null}
        correctStreak={session.correctStreak}
        generated={session.sessionMeta.generated}
      />

      <Card className="premium-card rounded-2xl border-gold/25 py-0">
        <CardHeader className="border-b border-navy-border/60 pb-6 text-center">
          <div className="mb-4 flex justify-center">
            <GuardianCharacter mood="neutral" size="lg" floating showLabel />
          </div>
          <CardTitle className="font-heading text-3xl font-bold tracking-wide text-foreground">
            Session Complete
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            You completed {session.sessionScenarios.length} scenario
            {session.sessionScenarios.length === 1 ? "" : "s"} in a{" "}
            {difficultyMeta.label.toLowerCase()} open session at{" "}
            {session.rank.abbreviation} — each one{" "}
            {session.sessionMeta.generated ? "Grok-generated" : "curated"} from
            the full founding corpus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <RankBadge rank={session.rank} size="lg" />
            <DifficultyBadge difficulty={session.sessionMeta.difficulty} />
            {session.sessionMeta.generated && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                <Sparkles className="size-3.5" />
                Grok Generated
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Total Defender Score",
                value: session.defenderScore.toLocaleString(),
                sub: `+${session.sessionPointsEarned} this session`,
                tone: "gold" as const,
              },
              {
                label: "Correct",
                value: `${correctCount}/${session.sessionScenarios.length}`,
                sub: null,
                tone: "neutral" as const,
              },
              {
                label: "Daily Streak",
                value: `${session.dailyStreak}d`,
                sub: null,
                tone: "crimson" as const,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.12 * index,
                  ease: EASE_OUT,
                }}
                className={cn(
                  "rounded-xl border p-5 text-center",
                  stat.tone === "gold" && "border-gold/20 bg-gold/5",
                  stat.tone === "neutral" &&
                    "border-navy-border/80 bg-navy-elevated/50",
                  stat.tone === "crimson" && "border-crimson/20 bg-crimson/5"
                )}
              >
                <p
                  className={cn(
                    "text-xs tracking-[0.2em] uppercase",
                    stat.tone === "gold" && "text-gold",
                    stat.tone === "neutral" && "text-muted-foreground",
                    stat.tone === "crimson" && "text-crimson/80"
                  )}
                >
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-2 font-heading text-3xl font-bold text-foreground",
                    stat.tone === "gold" && "score-glow"
                  )}
                >
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.sub}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <PressureReplayDebrief
            sessionScenarios={session.sessionScenarios}
            answers={session.answers}
          />

          {session.sessionScenarios[0] && (
            <FieldCardShare
              title={session.sessionScenarios[0].title}
              subtitle={session.sessionScenarios[0].amendmentLabel}
              body={
                session.sessionScenarios[0].rememberLine ??
                session.sessionScenarios[0].guardianPositive
              }
            />
          )}

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => void session.deploySession()}
              disabled={!session.canGenerate}
              className="btn-crimson min-w-[220px]"
            >
              <Sparkles className="size-4" />
              Start New Session
            </Button>
            {!session.canGenerate && (
              <Button
                onClick={session.resetToBriefing}
                variant="outline"
                className="min-w-[200px] border-navy-border text-muted-foreground hover:text-foreground"
              >
                View Briefing
              </Button>
            )}
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="btn-gold min-w-[200px]"
            >
              Return to Hub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Phase: briefing ─────────────────────────────────────────────────── */

function BriefingPhase({ session }: { session: TrainingSession }) {
  return (
    <div className="space-y-6">
      {session.isPremium && <PremiumAccessBanner />}
      <TrainingBriefing
        rank={session.rank}
        difficulty={session.difficulty}
        weakAreas={session.weakAreas}
        remainingGenerations={
          session.remaining === Infinity ? 999 : session.remaining
        }
        isPremium={session.isPremium}
        canGenerate={session.canGenerate}
        isDeploying={false}
        onDeploy={() => void session.deploySession()}
        onUpgrade={session.subscription.openUnlockModal}
      />
      {session.generationError && (
        <p className="rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-center text-sm text-crimson">
          {session.generationError}
        </p>
      )}
      {!session.isPremium && (
        <p className="text-center text-xs text-muted-foreground">
          Free: {session.remaining} fresh scenarios left today ·{" "}
          <button
            type="button"
            onClick={session.subscription.openUnlockModal}
            className="text-gold underline-offset-2 hover:underline"
          >
            {UNLOCK_FULL_LABEL}
          </button>
        </p>
      )}
    </div>
  );
}

/* ── Orchestrator ────────────────────────────────────────────────────── */

export function ScenarioExperience() {
  const session = useTrainingSession();
  const reduceMotion = useReducedMotion();

  const scenarioKey =
    session.phase === "training" && session.scenario
      ? `training-${session.scenario.id}`
      : session.phase;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [scenarioKey, reduceMotion]);

  const modals = (
    <>
      <DailyScenarioLimitModal
        open={session.limitModalOpen}
        onOpenChange={session.setLimitModalOpen}
        onUnlock={session.subscription.unlock}
        isPurchasing={session.subscription.isPurchasing}
        purchaseError={session.subscription.purchaseError}
      />
      <CertificationUnlockModal
        open={session.certUnlockOpen}
        onOpenChange={session.setCertUnlockOpen}
        certificationId={session.pendingCertId}
        record={session.pendingCertRecord}
        rankTitle={session.rank.title}
        bonusPoints={session.pendingCertBonus}
      />
    </>
  );

  if (!session.generationLoaded || !session.progressionState) {
    return (
      <>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="size-10 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">
            Loading training systems...
          </p>
        </div>
        {modals}
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scenarioKey}
          initial={reduceMotion ? false : PHASE_TRANSITION.initial}
          animate={reduceMotion ? undefined : PHASE_TRANSITION.animate}
          exit={reduceMotion ? undefined : PHASE_TRANSITION.exit}
          transition={PHASE_TRANSITION.transition}
        >
          {session.phase === "briefing" && <BriefingPhase session={session} />}
          {session.phase === "generating" && (
            <GeneratingPhase session={session} />
          )}
          {session.phase === "training" && session.scenario && (
            <TrainingPhase session={session} />
          )}
          {session.phase === "complete" && <CompletePhase session={session} />}
        </motion.div>
      </AnimatePresence>
      {modals}
    </>
  );
}
