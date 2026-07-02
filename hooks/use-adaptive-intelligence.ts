"use client";

import { useCallback, useMemo, useState } from "react";

import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import {
  buildAdaptivePerformanceSummary,
  canGenerateAdaptiveMission,
  getAdaptiveScenarioCount,
  getIntelligenceReport,
} from "@/lib/adaptive-intelligence";
import type { AdaptiveMissionBatchPayload } from "@/lib/grok-adaptive";
import { buildPerformanceSummary } from "@/lib/progression";

type GenerateMissionResult =
  | { success: true; mission: AdaptiveMissionBatchPayload }
  | { success: false; error: string };

export function useAdaptiveIntelligence() {
  const { state, isLoaded, rank, startPersonalizedMission } = useProgression();
  const { isPremium } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const report = useMemo(
    () => (state ? getIntelligenceReport(state) : null),
    [state]
  );

  const missionAccess = useMemo(
    () =>
      state
        ? canGenerateAdaptiveMission(state, isPremium)
        : { allowed: false, reason: null, remaining: 0 },
    [state, isPremium]
  );

  const scenarioCount = getAdaptiveScenarioCount(isPremium);
  const activeMission = state?.adaptiveMission ?? null;
  const hasActiveMission =
    Boolean(activeMission) && !activeMission?.completedAt;

  const generateMission = useCallback(async (): Promise<GenerateMissionResult> => {
    if (!state || !report) {
      return { success: false, error: "Progression not loaded yet." };
    }

    if (!missionAccess.allowed) {
      return {
        success: false,
        error: missionAccess.reason ?? "Cannot generate mission right now.",
      };
    }

    setIsGenerating(true);
    setError(null);

    try {
      const performanceSummary = buildAdaptivePerformanceSummary(state, report);

      const response = await fetch("/api/grok/adaptive-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          performanceSummary,
          focusAreas: report.recommendedFocus,
          weakAreas: report.weakAreas.map((area) => ({
            label: area.label,
            accuracy: area.accuracy,
          })),
          rankTitle: rank.title,
          rankAbbreviation: rank.abbreviation,
          difficulty: report.difficulty,
          scenarioCount,
          isPremium,
        }),
      });

      const data = (await response.json()) as {
        mission?: AdaptiveMissionBatchPayload;
        error?: string;
      };

      if (!response.ok || !data.mission) {
        throw new Error(data.error ?? "Mission generation failed.");
      }

      startPersonalizedMission({
        title: data.mission.missionTitle,
        focusAreas: data.mission.focusAreas,
        scenarios: data.mission.scenarios.map((scenario, index) => ({
          id: `adaptive-${Date.now()}-${index}`,
          title: scenario.title,
          focusArea: scenario.focusArea,
          topicId: scenario.topicId,
          sourceDocument: scenario.sourceDocument,
          scenario: scenario.scenario,
          question: scenario.question,
          choices: scenario.choices,
          correctChoiceId: scenario.correctChoiceId,
          explanation: scenario.explanation,
          difficultyLevel: scenario.difficultyLevel,
        })),
        difficulty: report.difficulty,
        isPremium,
      });

      return { success: true, mission: data.mission };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Mission generation failed.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsGenerating(false);
    }
  }, [
    state,
    report,
    missionAccess,
    rank,
    scenarioCount,
    isPremium,
    startPersonalizedMission,
  ]);

  const requestDebrief = useCallback(
    async (results: { focusArea: string; correct: boolean }[]) => {
      if (!state || !activeMission) return null;

      const correctCount = results.filter((item) => item.correct).length;

      const response = await fetch("/api/grok/adaptive-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "debrief",
          performanceSummary: buildPerformanceSummary(state),
          focusAreas: activeMission.focusAreas,
          results,
          correctCount,
          totalCount: results.length,
        }),
      });

      const data = (await response.json()) as { debrief?: string; error?: string };
      if (!response.ok || !data.debrief) {
        throw new Error(data.error ?? "Debrief generation failed.");
      }

      return data.debrief;
    },
    [state, activeMission]
  );

  return {
    isLoaded,
    report,
    missionAccess,
    scenarioCount,
    isPremium,
    activeMission,
    hasActiveMission,
    isGenerating,
    error,
    generateMission,
    requestDebrief,
    clearError: () => setError(null),
  };
}