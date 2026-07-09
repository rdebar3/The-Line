"use client";

/**
 * useTrainingSession — the Rights Under Pressure state machine, extracted
 * from the old ~900-line ScenarioExperience component.
 *
 * Phases: briefing → generating → training → complete
 *
 * Owns: session state, Grok generation calls, answer recording, daily-limit
 * and certification-unlock modal state. The view layer (ScenarioExperience)
 * only renders.
 *
 * Behavior is 1:1 with the previous implementation — same request payload to
 * /api/grok/scenarios, same progression recording — with one bug fixed: the
 * certification modal was rendered twice in the loading branch.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { useProgression } from "@/hooks/use-progression";
import { useScenarioGeneration } from "@/hooks/use-scenario-generation";
import { useSubscription } from "@/hooks/use-subscription";
import type { CertificationId } from "@/lib/certifications";
import {
  markDailyLimitModalShown,
  shouldOfferDailyLimitModal,
  wasDailyLimitModalShownToday,
} from "@/lib/daily-limit-modal";
import { getDocumentSlugFromSource } from "@/lib/document-links";
import {
  buildPerformanceSummary,
  getWeakAreas,
} from "@/lib/progression";
import {
  getDifficultyForRankObject,
  SCENARIOS_PER_REQUEST,
  type ScenarioDifficulty,
} from "@/lib/scenario-difficulty";
import {
  readScenarioGenerationState,
  recordScenarioGeneration,
} from "@/lib/scenario-generation";
import type { Scenario } from "@/lib/scenarios";

export type AnswerRecord = {
  scenarioId: string;
  choiceId: string;
  correct: boolean;
};

export type SessionMeta = {
  difficulty: ScenarioDifficulty;
  generated: boolean;
  fallback: boolean;
};

export type TrainingPhase = "briefing" | "generating" | "training" | "complete";

type ScenarioApiResponse = {
  scenarios?: Scenario[];
  difficulty?: ScenarioDifficulty;
  generated?: boolean;
  fallback?: boolean;
  assignedTopicId?: string;
  error?: string;
  message?: string;
};

export function useTrainingSession() {
  const { isSignedIn } = useAuth();

  const subscription = useSubscription();
  const isPremium = subscription.canAccess("all_scenarios");

  const {
    state: progressionState,
    recordAnswer,
    recordWeeklySession,
    defenderScore,
    rank,
    dailyStreak,
    correctStreak,
  } = useProgression();

  const {
    isLoaded: generationLoaded,
    state: generationState,
    remaining,
    canGenerate,
    canGenerateNext,
    refresh: refreshGeneration,
  } = useScenarioGeneration(isPremium);

  const difficulty = useMemo(() => getDifficultyForRankObject(rank), [rank]);

  const weakAreas = useMemo(() => {
    if (!progressionState) return [];
    return getWeakAreas(progressionState.weakAreas).map((area) => ({
      amendment: area.amendment,
      accuracy: area.accuracy,
    }));
  }, [progressionState]);

  /* ── Session state ─────────────────────────────────────────────────── */

  const [phase, setPhase] = useState<TrainingPhase>("briefing");
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

  /* ── Modal state ───────────────────────────────────────────────────── */

  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [certUnlockOpen, setCertUnlockOpen] = useState(false);
  const [pendingCertId, setPendingCertId] = useState<CertificationId | null>(
    null
  );
  const [pendingCertBonus, setPendingCertBonus] = useState(0);

  const pendingCertRecord =
    pendingCertId && progressionState?.certifications
      ? (progressionState.certifications.find(
          (cert) => cert.id === pendingCertId
        ) ?? null)
      : null;

  const offerDailyLimitModal = useCallback(() => {
    if (
      !shouldOfferDailyLimitModal({
        isSignedIn: Boolean(isSignedIn),
        isPremium,
        scenariosGenerated: generationState.scenariosGenerated,
      })
    ) {
      return;
    }

    if (wasDailyLimitModalShownToday()) return;

    markDailyLimitModalShown();
    setLimitModalOpen(true);
  }, [isSignedIn, isPremium, generationState.scenariosGenerated]);

  useEffect(() => {
    if (!generationLoaded || subscription.isLoading) return;
    offerDailyLimitModal();
  }, [generationLoaded, subscription.isLoading, offerDailyLimitModal]);

  /* ── Derived ───────────────────────────────────────────────────────── */

  const scenario = sessionScenarios[currentIndex];

  const currentAnswer = scenario
    ? answers.find((answer) => answer.scenarioId === scenario.id)
    : undefined;
  const hasAnswered = Boolean(currentAnswer);

  const generatingFocusLabel = useMemo(() => {
    const lastScenario = sessionScenarios[sessionScenarios.length - 1];
    if (lastScenario?.amendmentLabel) return lastScenario.amendmentLabel;
    if (weakAreas[0]?.amendment) return weakAreas[0].amendment;
    return "Rights Under Pressure";
  }, [sessionScenarios, weakAreas]);

  const sessionFocusLabel = useMemo(() => {
    const current = sessionScenarios[currentIndex];
    if (current?.amendmentLabel) return current.amendmentLabel;
    const last = sessionScenarios[sessionScenarios.length - 1];
    return last?.amendmentLabel ?? "Rights Under Pressure";
  }, [sessionScenarios, currentIndex]);

  /* ── Generation ────────────────────────────────────────────────────── */

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
          scenarioIndexInSession,
          sessionTopicIds: activeSessionTopicIds,
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

      const data = (await response.json()) as ScenarioApiResponse;

      if (!response.ok || !data.scenarios?.length) {
        throw new Error(data.error ?? "Could not generate scenario.");
      }

      const assignedTopicId = data.assignedTopicId ?? data.scenarios[0].id;
      const sourceDocument = data.scenarios[0].sourceDocument;
      const nextScenario: Scenario = {
        ...data.scenarios[0],
        sourceDocument,
        documentSlug:
          data.scenarios[0].documentSlug ??
          getDocumentSlugFromSource(sourceDocument) ??
          undefined,
        rememberLine:
          data.scenarios[0].rememberLine ?? data.scenarios[0].guardianPositive,
      };

      recordScenarioGeneration(SCENARIOS_PER_REQUEST, isPremium, {
        topicIds: [assignedTopicId],
        titles: [nextScenario.title],
        isNewSession: resetSession,
      });
      refreshGeneration();

      return {
        scenario: nextScenario,
        meta: {
          difficulty: data.difficulty ?? difficulty,
          generated: Boolean(data.generated),
          fallback: Boolean(data.fallback),
        },
        topicId: assignedTopicId,
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

  /* ── Actions ───────────────────────────────────────────────────────── */

  const deploySession = useCallback(async () => {
    if (!progressionState) return;

    if (!canGenerate) {
      offerDailyLimitModal();
      return;
    }

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
  }, [progressionState, canGenerate, fetchScenario, offerDailyLimitModal]);

  const nextScenario = useCallback(async () => {
    if (!canGenerateNext) {
      offerDailyLimitModal();
      return;
    }

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
  }, [
    canGenerateNext,
    fetchScenario,
    offerDailyLimitModal,
    sessionScenarios.length,
  ]);

  const chooseAnswer = useCallback(
    (choiceId: string) => {
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

        if (result.newCertifications.length > 0) {
          const certId = result.newCertifications[0]!;
          setPendingCertId(certId);
          setPendingCertBonus(result.certificationBonus);
          setCertUnlockOpen(true);
        }
      }
    },
    [scenario, hasAnswered, recordAnswer]
  );

  const endSession = useCallback(() => {
    if (answers.length === 0) return;
    setPhase("complete");
    recordWeeklySession(sessionPointsEarned);
  }, [answers.length, recordWeeklySession, sessionPointsEarned]);

  const resetToBriefing = useCallback(() => {
    setPhase("briefing");
    setSessionScenarios([]);
    setSessionTopicIds([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedChoiceId(null);
    setGenerationError(null);
  }, []);

  return {
    // Phase & session
    phase,
    scenario,
    sessionScenarios,
    sessionMeta,
    answers,
    currentAnswer,
    hasAnswered,
    selectedChoiceId,
    generationError,
    lastPointsEarned,
    sessionPointsEarned,
    isFirstDeploy,
    generatingFocusLabel,
    sessionFocusLabel,

    // Progression
    progressionState,
    defenderScore,
    rank,
    dailyStreak,
    correctStreak,
    difficulty,
    weakAreas,

    // Generation quota
    generationLoaded,
    remaining,
    canGenerate,
    canGenerateNext,

    // Subscription
    isPremium,
    subscription,

    // Modals
    limitModalOpen,
    setLimitModalOpen,
    certUnlockOpen,
    setCertUnlockOpen,
    pendingCertId,
    pendingCertBonus,
    pendingCertRecord,

    // Actions
    deploySession,
    nextScenario,
    chooseAnswer,
    endSession,
    resetToBriefing,
  };
}

export type TrainingSession = ReturnType<typeof useTrainingSession>;
