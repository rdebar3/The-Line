"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Scale,
  Sparkles,
  XCircle,
} from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { FieldDebriefPanel } from "@/components/rights/field-debrief-panel";
import { RankBadge } from "@/components/progression/rank-badge";
import { GuardianReaction } from "@/components/rights/guardian-reaction";
import { TrainingBriefing } from "@/components/rights/training-briefing";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useScenarioGeneration } from "@/hooks/use-scenario-generation";
import { useSubscription } from "@/hooks/use-subscription";
import {
  buildPerformanceSummary,
  getWeakAreas,
} from "@/lib/progression";
import {
  DIFFICULTY_LABELS,
  getDifficultyForRankObject,
  SCENARIOS_PER_REQUEST,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";
import {
  DOCUMENT_FAMILY_LABELS,
  getDocumentFamilyFromSource,
  pickNextTopicAssignment,
  type DocumentFamily,
} from "@/lib/scenario-curriculum";
import {
  getSituationHeading,
  QUESTION_FORMAT_LABELS,
} from "@/lib/question-formats";
import {
  getScenarioSourceBadge,
  getScenarioSourceDocument,
} from "@/lib/scenario-display";
import {
  readScenarioGenerationState,
  recordScenarioGeneration,
} from "@/lib/scenario-generation";
import { SourceLinksPanel } from "@/components/rights/source-links-panel";
import { PressureReplayDebrief } from "@/components/rights/pressure-replay-debrief";
import { FieldCardShare } from "@/components/share/field-card-share";
import { AudioModeToggle } from "@/components/audio/audio-mode-toggle";
import { EducationalDisclaimer } from "@/components/legal/educational-disclaimer";
import { useAudioMode } from "@/hooks/use-audio-mode";
import { getDocumentSlugFromSource } from "@/lib/document-links";
import { SCENARIO_DISCLAIMER } from "@/lib/legal-disclaimers";
import { UNLOCK_FULL_LABEL } from "@/lib/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

type AnswerRecord = {
  scenarioId: string;
  choiceId: string;
  correct: boolean;
};

type SessionMeta = {
  difficulty: ScenarioDifficulty;
  generated: boolean;
  fallback: boolean;
};

type Phase = "briefing" | "generating" | "training" | "complete";

function DefenderScoreBadge({
  score,
  pointsEarned,
}: {
  score: number;
  pointsEarned: number | null;
}) {
  return (
    <div className="rounded-xl border border-gold/25 bg-navy-elevated/80 px-4 py-3 text-center sm:text-right">
      <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-gold uppercase">
        Defender Score
      </p>
      <p className="score-glow font-heading text-3xl font-bold text-foreground">
        {score}
      </p>
      {pointsEarned !== null && pointsEarned > 0 && (
        <p className="mt-1 text-xs font-medium text-gold">+{pointsEarned} pts</p>
      )}
    </div>
  );
}

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

function SessionDocumentCoverage({
  sessionScenarios,
}: {
  sessionScenarios: Scenario[];
}) {
  const coveredFamilies = new Set<DocumentFamily>(
    sessionScenarios.map((scenario) =>
      getDocumentFamilyFromSource(
        scenario.sourceDocument ?? getScenarioSourceDocument(scenario)
      )
    )
  );

  const trackFamilies: DocumentFamily[] = [
    "declaration",
    "constitution",
    "bill-of-rights",
    "principles",
    "later-amendments",
  ];

  return (
    <div className="rounded-xl border border-navy-border/70 bg-navy/40 px-4 py-3">
      <p className="font-heading text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
        Corpus coverage this session
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {trackFamilies.map((family) => {
          const covered = coveredFamilies.has(family);
          return (
            <span
              key={family}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[0.65rem] font-medium tracking-wide",
                covered
                  ? "border-gold/30 bg-gold/10 text-gold"
                  : "border-navy-border/60 bg-navy-elevated/40 text-muted-foreground/70"
              )}
            >
              {DOCUMENT_FAMILY_LABELS[family]}
              {covered && (
                <CheckCircle2 className="ml-1 inline size-3" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioProgress({
  sessionScenarios,
  currentIndex,
  answers,
}: {
  sessionScenarios: Scenario[];
  currentIndex: number;
  answers: AnswerRecord[];
}) {
  return (
    <>
      <div role="list" className="flex items-center gap-2 sm:hidden">
        {sessionScenarios.map((scenario, index) => {
          const answer = answers.find((item) => item.scenarioId === scenario.id);
          const isCurrent = index === currentIndex;
          const isComplete = Boolean(answer);

          return (
            <div
              key={scenario.id}
              role="listitem"
              className={cn(
                "h-2.5 flex-1 rounded-full transition-all duration-300",
                isCurrent && "bg-gold",
                !isCurrent &&
                  isComplete &&
                  answer?.correct &&
                  "bg-gold/50",
                !isCurrent &&
                  isComplete &&
                  !answer?.correct &&
                  "bg-crimson/50",
                !isCurrent && !isComplete && "bg-navy-border/60"
              )}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground sm:hidden">
        Scenario {currentIndex + 1} · Session active
      </p>

      <div className="hidden flex-wrap gap-2 sm:flex">
        {sessionScenarios.map((scenario, index) => {
          const answer = answers.find((item) => item.scenarioId === scenario.id);
          const isCurrent = index === currentIndex;
          const isComplete = Boolean(answer);

          return (
            <div
              key={scenario.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                isCurrent && "border-gold/40 bg-gold/10 text-gold",
                !isCurrent &&
                  isComplete &&
                  answer?.correct &&
                  "border-gold/20 bg-gold/5 text-gold/80",
                !isCurrent &&
                  isComplete &&
                  !answer?.correct &&
                  "border-crimson/20 bg-crimson/5 text-crimson/80",
                !isCurrent &&
                  !isComplete &&
                  "border-navy-border/60 bg-navy-elevated/40 text-muted-foreground"
              )}
            >
              <span className="font-heading tracking-wide">
                {getScenarioSourceBadge(scenario)}
              </span>
              {scenario.generated && (
                <Sparkles className="size-3 text-gold/70" />
              )}
              {isComplete &&
                (answer?.correct ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <XCircle className="size-3.5" />
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

function TrainingSessionHeader({
  scenarioNumber,
  difficulty,
  defenderScore,
  pointsEarned,
  correctStreak,
}: {
  scenarioNumber: number;
  difficulty: ScenarioDifficulty;
  defenderScore: number;
  pointsEarned: number | null;
  correctStreak: number;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-xs font-semibold tracking-[0.35em] text-crimson uppercase">
            Training Session
          </p>
          {scenarioNumber > 0 && (
            <p className="font-heading text-xs font-semibold tracking-[0.35em] text-muted-foreground uppercase">
              Scenario {scenarioNumber}
            </p>
          )}
          <span className="rounded-md border border-gold/20 bg-gold/5 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-gold">
            Open session
          </span>
          <DifficultyBadge difficulty={difficulty} />
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          Rights Under Pressure
        </h1>
      </div>
      <div className="flex flex-col items-center gap-3 sm:items-end">
        <AudioModeToggle />
        <DefenderScoreBadge score={defenderScore} pointsEarned={pointsEarned} />
        {correctStreak > 0 && (
          <p className="text-xs font-medium tracking-wide text-gold">
            {correctStreak} correct streak
          </p>
        )}
      </div>
    </div>
  );
}

function GeneratingScreen({
  scenarioNumber,
  difficulty,
  defenderScore,
  isFirstScenario,
}: {
  scenarioNumber: number;
  difficulty: ScenarioDifficulty;
  defenderScore: number;
  isFirstScenario: boolean;
}) {
  return (
    <div className="space-y-8">
      <TrainingSessionHeader
        scenarioNumber={scenarioNumber}
        difficulty={difficulty}
        defenderScore={defenderScore}
        pointsEarned={null}
        correctStreak={0}
      />

      <Card className="premium-card rounded-2xl border-gold/25 py-0">
        <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
          <Loader2 className="size-12 animate-spin text-gold" />
          <div className="max-w-md space-y-2">
            <p className="font-heading text-xl font-semibold tracking-wide text-foreground">
              {isFirstScenario
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-300">
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
          {isCorrect ? "Correct" : "Not quite"}
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
      <p className="text-[0.65rem] text-muted-foreground/70">{SCENARIO_DISCLAIMER}</p>
    </div>
  );
}

function CompletionScreen({
  sessionScore,
  answers,
  sessionScenarios,
  sessionMeta,
  defenderScore,
  rank,
  dailyStreak,
  onNewSession,
  onReturnToBriefing,
  canGenerate,
}: {
  sessionScore: number;
  answers: AnswerRecord[];
  sessionScenarios: Scenario[];
  sessionMeta: SessionMeta;
  defenderScore: number;
  rank: ReturnType<typeof useProgression>["rank"];
  dailyStreak: number;
  onNewSession: () => void;
  onReturnToBriefing: () => void;
  canGenerate: boolean;
}) {
  const correctCount = answers.filter((answer) => answer.correct).length;
  const difficultyMeta = DIFFICULTY_LABELS[sessionMeta.difficulty];

  return (
    <Card className="premium-card rounded-2xl border-gold/25 py-0">
      <CardHeader className="border-b border-navy-border/60 pb-6 text-center">
        <div className="mb-4 flex justify-center">
          <GuardianCharacter mood="neutral" size="lg" floating showLabel />
        </div>
        <CardTitle className="font-heading text-3xl font-bold tracking-wide text-foreground">
          Session Complete
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          You completed {sessionScenarios.length} scenario
          {sessionScenarios.length === 1 ? "" : "s"} in a {difficultyMeta.label.toLowerCase()}{" "}
          open session at {rank.abbreviation} — each one{" "}
          {sessionMeta.generated ? "Grok-generated" : "curated"} from the full
          founding corpus.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <RankBadge rank={rank} size="lg" />
          <DifficultyBadge difficulty={sessionMeta.difficulty} />
          {sessionMeta.generated && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="size-3.5" />
              Grok Generated
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-5 text-center">
            <p className="text-xs tracking-[0.2em] text-gold uppercase">
              Total Defender Score
            </p>
            <p className="score-glow mt-2 font-heading text-3xl font-bold text-foreground">
              {defenderScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              +{sessionScore} this session
            </p>
          </div>
          <div className="rounded-xl border border-navy-border/80 bg-navy-elevated/50 p-5 text-center">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Correct
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {correctCount}/{sessionScenarios.length}
            </p>
          </div>
          <div className="rounded-xl border border-crimson/20 bg-crimson/5 p-5 text-center">
            <p className="text-xs tracking-[0.2em] text-crimson/80 uppercase">
              Daily Streak
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {dailyStreak}
              <span className="text-base font-medium text-muted-foreground">
                d
              </span>
            </p>
          </div>
        </div>

        <PressureReplayDebrief
          sessionScenarios={sessionScenarios}
          answers={answers}
        />

        {sessionScenarios[0] && (
          <FieldCardShare
            title={sessionScenarios[0].title}
            subtitle={sessionScenarios[0].amendmentLabel}
            body={
              sessionScenarios[0].rememberLine ??
              sessionScenarios[0].guardianPositive
            }
          />
        )}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={onNewSession}
            disabled={!canGenerate}
            className="btn-crimson min-w-[220px]"
          >
            <Sparkles className="size-4" />
            Start New Session
          </Button>
          {!canGenerate && (
            <Button
              onClick={onReturnToBriefing}
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
  );
}

export function ScenarioExperience() {
  const { canAccess, openUnlockModal } = useSubscription();
  const isPremium = canAccess("all_scenarios");

  const {
    state: progressionState,
    recordAnswer,
    recordWeeklySession,
    defenderScore,
    rank,
    dailyStreak,
    correctStreak,
  } = useProgression();

  const { enabled: audioEnabled, speak } = useAudioMode();

  const {
    isLoaded: generationLoaded,
    state: generationState,
    remaining,
    canGenerate,
    canGenerateNext,
    refresh: refreshGeneration,
  } = useScenarioGeneration(isPremium);

  const difficulty = useMemo(
    () => getDifficultyForRankObject(rank),
    [rank]
  );

  const weakAreas = useMemo(() => {
    if (!progressionState) return [];
    return getWeakAreas(progressionState.weakAreas).map((area) => ({
      amendment: area.amendment,
      accuracy: area.accuracy,
    }));
  }, [progressionState]);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [sessionScenarios, setSessionScenarios] = useState<Scenario[]>([]);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta>({
    difficulty,
    generated: false,
    fallback: false,
  });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState<number | null>(null);
  const [sessionPointsEarned, setSessionPointsEarned] = useState(0);
  const [sessionTopicIds, setSessionTopicIds] = useState<string[]>([]);
  const [isFirstDeploy, setIsFirstDeploy] = useState(true);

  const fetchScenario = useCallback(
    async ({
      scenarioIndexInSession,
      resetSession,
    }: {
      scenarioIndexInSession: number;
      resetSession: boolean;
    }) => {
      if (!progressionState) {
        throw new Error("Progression not loaded.");
      }

      const sessionSeed = Date.now() + Math.floor(Math.random() * 10000);
      const generationHistory = readScenarioGenerationState();
      const sessionTitles = resetSession
        ? []
        : sessionScenarios.map((item) => item.title);
      const sessionIds = resetSession
        ? []
        : sessionScenarios.map((item) => item.id);
      const activeSessionTopicIds = resetSession ? [] : sessionTopicIds;

      const topicAssignment = pickNextTopicAssignment({
        difficulty,
        weakAreas: weakAreas.map((area) => area.amendment),
        recentTopicIds: [
          ...generationHistory.recentTopicIds,
          ...generationState.recentTopicIds,
          ...activeSessionTopicIds,
        ],
        sessionTopicIds: activeSessionTopicIds,
        scenarioIndexInSession,
        sessionSeed,
      });

      const response = await fetch("/api/grok/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          rankTitle: rank.title,
          rankAbbreviation: rank.abbreviation,
          sessionSize: SCENARIOS_PER_REQUEST,
          performanceSummary: buildPerformanceSummary(progressionState),
          weakAreas: weakAreas.map((area) => area.amendment),
          isPremium,
          sessionSeed,
          topicAssignments: [topicAssignment],
          previousScenarioIds: [
            ...progressionState.scenarioHistory
              .slice(-25)
              .map((entry) => entry.scenarioId),
            ...sessionIds,
          ],
          previousScenarioTitles: [
            ...generationHistory.recentScenarioTitles,
            ...generationState.recentScenarioTitles,
            ...sessionTitles,
          ],
          recentTopicIds: [
            ...generationHistory.recentTopicIds,
            ...generationState.recentTopicIds,
            ...activeSessionTopicIds,
          ],
        }),
      });

      const data = (await response.json()) as {
        scenarios?: Scenario[];
        difficulty?: ScenarioDifficulty;
        generated?: boolean;
        fallback?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.scenarios?.length) {
        throw new Error(data.error ?? "Could not generate scenario.");
      }

      const sourceDocument =
        data.scenarios[0].sourceDocument ?? topicAssignment.sourceDocument;
      const scenario: Scenario = {
        ...data.scenarios[0],
        sourceDocument,
        questionFormat:
          data.scenarios[0].questionFormat ?? topicAssignment.questionFormat,
        amendmentLabel:
          data.scenarios[0].amendmentLabel || topicAssignment.amendmentLabel,
        amendment: data.scenarios[0].amendment || topicAssignment.amendment,
        passageIds:
          data.scenarios[0].passageIds ?? topicAssignment.passageIds,
        documentSlug:
          data.scenarios[0].documentSlug ??
          getDocumentSlugFromSource(sourceDocument) ??
          undefined,
        rememberLine:
          data.scenarios[0].rememberLine ?? data.scenarios[0].guardianPositive,
      };

      recordScenarioGeneration(SCENARIOS_PER_REQUEST, isPremium, {
        topicIds: [topicAssignment.topicId],
        titles: [scenario.title],
        isNewSession: resetSession,
      });
      refreshGeneration();

      return {
        scenario,
        meta: {
          difficulty: data.difficulty ?? difficulty,
          generated: Boolean(data.generated),
          fallback: Boolean(data.fallback),
        },
        topicId: topicAssignment.topicId,
      };
    },
    [
      progressionState,
      difficulty,
      rank,
      weakAreas,
      isPremium,
      refreshGeneration,
      generationState.recentTopicIds,
      generationState.recentScenarioTitles,
      sessionScenarios,
      sessionTopicIds,
    ]
  );

  const deploySession = useCallback(async () => {
    if (!progressionState || !canGenerate) return;

    setPhase("generating");
    setIsFirstDeploy(true);
    setGenerationError(null);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedChoiceId(null);
    setLastPointsEarned(null);
    setSessionPointsEarned(0);
    setSessionTopicIds([]);
    setSessionScenarios([]);

    try {
      const result = await fetchScenario({
        scenarioIndexInSession: 0,
        resetSession: true,
      });

      setSessionScenarios([result.scenario]);
      setSessionTopicIds([result.topicId]);
      setSessionMeta(result.meta);
      setPhase("training");
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Generation failed."
      );
      setPhase("briefing");
    }
  }, [progressionState, canGenerate, fetchScenario]);

  const resetToBriefing = useCallback(() => {
    setPhase("briefing");
    setSessionScenarios([]);
    setSessionTopicIds([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedChoiceId(null);
    setGenerationError(null);
  }, []);

  const handleEndSession = useCallback(() => {
    if (answers.length === 0) return;
    setPhase("complete");
    recordWeeklySession(sessionPointsEarned);
  }, [answers.length, recordWeeklySession, sessionPointsEarned]);

  const scenario = sessionScenarios[currentIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase, currentIndex]);

  useEffect(() => {
    if (!audioEnabled || !scenario || phase !== "training") return;
    speak(`${scenario.title}. ${scenario.situation}`);
  }, [audioEnabled, scenario, phase, speak]);
  const currentAnswer = scenario
    ? answers.find((answer) => answer.scenarioId === scenario.id)
    : undefined;
  const hasAnswered = Boolean(currentAnswer);

  function handleChoice(choiceId: string) {
    if (!scenario || hasAnswered) return;

    const correct = choiceId === scenario.correctChoiceId;
    setSelectedChoiceId(choiceId);
    setAnswers((previous) => [
      ...previous,
      { scenarioId: scenario.id, choiceId, correct },
    ]);

    const result = recordAnswer({
      scenarioId: scenario.id,
      amendment: scenario.amendmentLabel,
      correct,
    });

    if (result) {
      setLastPointsEarned(result.pointsEarned);
      setSessionPointsEarned((previous) => previous + result.pointsEarned);
    }
  }

  async function handleNextScenario() {
    if (!canGenerateNext) return;

    setSelectedChoiceId(null);
    setLastPointsEarned(null);
    setGenerationError(null);
    setIsFirstDeploy(false);
    setPhase("generating");

    try {
      const result = await fetchScenario({
        scenarioIndexInSession: sessionScenarios.length,
        resetSession: false,
      });

      setSessionScenarios((previous) => [...previous, result.scenario]);
      setSessionTopicIds((previous) => [...previous, result.topicId]);
      setSessionMeta((previous) => ({
        ...previous,
        generated: result.meta.generated,
        fallback: result.meta.fallback,
      }));
      setCurrentIndex(sessionScenarios.length);
      setPhase("training");
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Could not load next scenario."
      );
      setPhase("training");
    }
  }

  if (!generationLoaded || !progressionState) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-gold" />
        <p className="text-sm text-muted-foreground">
          Loading training systems...
        </p>
      </div>
    );
  }

  if (phase === "briefing") {
    return (
      <div className="space-y-6">
        <TrainingBriefing
          rank={rank}
          difficulty={difficulty}
          weakAreas={weakAreas}
          remainingGenerations={remaining === Infinity ? 999 : remaining}
          isPremium={isPremium}
          canGenerate={canGenerate}
          isDeploying={false}
          onDeploy={() => void deploySession()}
          onUpgrade={openUnlockModal}
        />
        {generationError && (
          <p className="rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-center text-sm text-crimson">
            {generationError}
          </p>
        )}
        {!isPremium && (
          <p className="text-center text-xs text-muted-foreground">
            Free: {remaining} fresh scenarios left today ·{" "}
            <button
              type="button"
              onClick={openUnlockModal}
              className="text-gold underline-offset-2 hover:underline"
            >
              {UNLOCK_FULL_LABEL}
            </button>
          </p>
        )}
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <GeneratingScreen
        scenarioNumber={
          isFirstDeploy ? 1 : sessionScenarios.length + 1
        }
        difficulty={difficulty}
        defenderScore={defenderScore}
        isFirstScenario={isFirstDeploy}
      />
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-8">
        <TrainingSessionHeader
          scenarioNumber={sessionScenarios.length}
          difficulty={sessionMeta.difficulty}
          defenderScore={defenderScore}
          pointsEarned={null}
          correctStreak={correctStreak}
        />
        <CompletionScreen
          sessionScore={sessionPointsEarned}
          answers={answers}
          sessionScenarios={sessionScenarios}
          sessionMeta={sessionMeta}
          defenderScore={defenderScore}
          rank={rank}
          dailyStreak={dailyStreak}
          onNewSession={() => void deploySession()}
          onReturnToBriefing={resetToBriefing}
          canGenerate={canGenerate}
        />
      </div>
    );
  }

  if (!scenario) {
    return null;
  }

  return (
    <div className="space-y-8">
      <TrainingSessionHeader
        scenarioNumber={currentIndex + 1}
        difficulty={sessionMeta.difficulty}
        defenderScore={defenderScore}
        pointsEarned={lastPointsEarned}
        correctStreak={correctStreak}
      />

      {scenario.generated && (
        <p className="-mt-4 flex items-center gap-1.5 text-xs font-medium tracking-wide text-gold">
          <Sparkles className="size-3" />
          Grok-generated scenario
        </p>
      )}

      <SessionDocumentCoverage sessionScenarios={sessionScenarios} />

      <ScenarioProgress
        sessionScenarios={sessionScenarios}
        currentIndex={currentIndex}
        answers={answers}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="premium-card rounded-2xl py-0">
          <CardHeader className="gap-3 border-b border-navy-border/60">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-gold/25 bg-gold/10 px-3 py-1 font-heading text-sm font-semibold tracking-wide text-gold">
                {getScenarioSourceBadge(scenario)}
              </span>
              <span className="text-sm font-medium text-foreground/90">
                {getScenarioSourceDocument(scenario)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{scenario.amendmentLabel}</p>
            {scenario.questionFormat && (
              <span className="inline-flex w-fit rounded-md border border-navy-border/70 bg-navy/50 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
                {QUESTION_FORMAT_LABELS[scenario.questionFormat]}
              </span>
            )}
            <CardTitle className="font-heading text-2xl font-semibold text-foreground">
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
                {scenario.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrectChoice =
                    choice.id === scenario.correctChoiceId;
                  const showResult = hasAnswered;

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleChoice(choice.id)}
                      className={cn(
                        "min-h-[52px] rounded-xl border px-4 py-4 text-left text-sm leading-relaxed transition-all",
                        "disabled:cursor-default active:scale-[0.99]",
                        !showResult &&
                          "border-navy-border/80 bg-navy/60 hover:border-gold/30 hover:bg-navy-elevated",
                        showResult &&
                          isCorrectChoice &&
                          "border-gold/40 bg-gold/10 text-foreground",
                        showResult &&
                          isSelected &&
                          !isCorrectChoice &&
                          "border-crimson/40 bg-crimson/10 text-foreground",
                        showResult &&
                          !isSelected &&
                          !isCorrectChoice &&
                          "border-navy-border/50 bg-navy/40 text-muted-foreground"
                      )}
                    >
                      <span className="mr-3 font-heading font-semibold text-gold uppercase">
                        {choice.id}.
                      </span>
                      {choice.label}
                    </button>
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
              <div className="flex flex-col gap-3 border-t border-navy-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                    onClick={handleEndSession}
                    variant="outline"
                    className="min-w-[160px] border-navy-border text-muted-foreground hover:text-foreground"
                  >
                    End Session
                  </Button>
                  <Button
                    onClick={() => void handleNextScenario()}
                    disabled={!canGenerateNext}
                    className="btn-gold min-w-[180px]"
                  >
                    Next Scenario
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
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
            sessionMeta.difficulty === "hard"
              ? "This is command-level pressure. Weigh the facts, identify the governing principle, then commit."
              : sessionMeta.difficulty === "medium"
                ? "Multiple principles may compete. Find the line the Constitution draws — not the line power prefers."
                : "Read the situation carefully. The Constitution gives you the standard — apply it before the pressure decides for you."
          }
        />
      </div>
    </div>
  );
}