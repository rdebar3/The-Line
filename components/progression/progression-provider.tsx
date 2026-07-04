"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { checkAndAwardCertifications } from "@/lib/certifications";
import {
  clearPromotionCommentary,
  completeOnboardingPath,
  getDailyMissionTemplate,
  getNextRank,
  getRankForScore,
  getRankProgress,
  mergeCloudProgressionState,
  recordHubActivity,
  recordRepublicSimulatorCompletion,
  recordScenarioAnswer,
  recordWeeklyChallengeSession,
  addGrokMission,
  answerAdaptiveMissionScenario,
  clearAdaptiveMission,
  completeGrokMission,
  finalizeAdaptiveMission,
  setSquadMembership,
  startAdaptiveMission,
  type GrokMission,
  type ProgressionState,
} from "@/lib/progression";
import type {
  AdaptiveMissionScenario,
  AdaptiveMissionSession,
} from "@/lib/adaptive-intelligence";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";
import type { OnboardingGoal } from "@/lib/onboarding-path";
import { isCloudSaveConfigured } from "@/lib/progression-cloud";
import {
  readProgressionState,
  writeProgressionState,
} from "@/lib/progression-store";

type ProgressionContextValue = {
  state: ProgressionState | null;
  isLoaded: boolean;
  defenderScore: number;
  dailyStreak: number;
  longestStreak: number;
  correctStreak: number;
  rank: ReturnType<typeof getRankForScore>;
  nextRank: ReturnType<typeof getNextRank>;
  rankProgress: ReturnType<typeof getRankProgress>;
  dailyMission: ReturnType<typeof getDailyMissionTemplate> & {
    progress: number;
    completed: boolean;
  } | null;
  pendingPromotion: ProgressionState["pendingPromotionCommentary"];
  grokMissions: GrokMission[];
  adaptiveMission: AdaptiveMissionSession | null;
  startPersonalizedMission: (mission: {
    title: string;
    focusAreas: string[];
    scenarios: Omit<
      AdaptiveMissionScenario,
      "answered" | "selectedChoiceId" | "correct"
    >[];
    difficulty: ScenarioDifficulty;
    isPremium: boolean;
  }) => void;
  answerAdaptiveScenario: (
    scenarioId: string,
    choiceId: string
  ) => ReturnType<typeof answerAdaptiveMissionScenario> | null;
  completeAdaptiveMission: (
    debrief: string
  ) => ReturnType<typeof finalizeAdaptiveMission> | null;
  dismissAdaptiveMission: () => void;
  recordAnswer: (record: {
    scenarioId: string;
    amendment: string;
    correct: boolean;
  }) => ReturnType<typeof recordScenarioAnswer> | null;
  logHubActivity: () => void;
  dismissPromotion: () => void;
  saveGrokMission: (
    mission: Omit<GrokMission, "id" | "createdAt" | "completed">
  ) => void;
  finishGrokMission: (
    missionId: string,
    correct: boolean
  ) => ReturnType<typeof completeGrokMission> | null;
  completeOnboarding: (goal: OnboardingGoal) => void;
  recordWeeklySession: (sessionScore: number) => void;
  setSquadId: (squadId: string | null) => void;
  completeRepublicSimulator: (record: {
    scenarioId: string;
    roleId: string;
    fidelityScore: number;
    pointsEarned: number;
  }) => ReturnType<typeof recordRepublicSimulatorCompletion> | null;
};

const ProgressionContext = createContext<ProgressionContextValue | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [state, setState] = useState<ProgressionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoaded) {
      setIsLoaded(false);
      return;
    }

    let local = readProgressionState();

    async function hydrate() {
      if (isSignedIn && userId && isCloudSaveConfigured()) {
        try {
          const res = await fetch("/api/progression");
          if (res.ok) {
            const data = (await res.json()) as {
              state?: Partial<ProgressionState> | null;
            };
            if (data.state) {
              local = mergeCloudProgressionState(local, data.state);
              writeProgressionState(local);
            }
          }
        } catch {
          /* local only */
        }
      }
      const certResult = checkAndAwardCertifications(local);
      if (certResult.newlyAwarded.length > 0) {
        local = certResult.state;
        writeProgressionState(local);
      }

      setState(local);
      setIsLoaded(true);
    }

    void hydrate();
  }, [authLoaded, isSignedIn, userId]);

  useEffect(() => {
    function handleLocalProgressionUpdate() {
      setState(readProgressionState());
    }

    window.addEventListener(
      "theline:progression-local-updated",
      handleLocalProgressionUpdate
    );
    return () => {
      window.removeEventListener(
        "theline:progression-local-updated",
        handleLocalProgressionUpdate
      );
    };
  }, []);

  const persist = useCallback(
    (next: ProgressionState) => {
      setState(next);
      writeProgressionState(next);
      if (isSignedIn && userId && isCloudSaveConfigured()) {
        void fetch("/api/progression", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: next }),
        });
      }
    },
    [isSignedIn, userId]
  );

  const recordAnswer = useCallback(
    (record: {
      scenarioId: string;
      amendment: string;
      correct: boolean;
    }) => {
      if (!state) return null;
      const result = recordScenarioAnswer(state, record);
      persist(result.state);
      return result;
    },
    [persist, state]
  );

  const logHubActivity = useCallback(() => {
    if (!state || state.todayStats.activityLogged) return;
    persist(recordHubActivity(state));
  }, [persist, state]);

  const dismissPromotion = useCallback(() => {
    if (!state) return;
    persist(clearPromotionCommentary(state));
  }, [persist, state]);

  const saveGrokMission = useCallback(
    (mission: Omit<GrokMission, "id" | "createdAt" | "completed">) => {
      if (!state) return;
      persist(addGrokMission(state, mission));
    },
    [persist, state]
  );

  const finishGrokMission = useCallback(
    (missionId: string, correct: boolean) => {
      if (!state) return null;
      const result = completeGrokMission(state, missionId, correct);
      persist(result.state);
      return result;
    },
    [persist, state]
  );

  const startPersonalizedMission = useCallback(
    (mission: {
      title: string;
      focusAreas: string[];
      scenarios: Omit<
        AdaptiveMissionScenario,
        "answered" | "selectedChoiceId" | "correct"
      >[];
      difficulty: ScenarioDifficulty;
      isPremium: boolean;
    }) => {
      if (!state) return;
      persist(startAdaptiveMission(state, mission));
    },
    [persist, state]
  );

  const answerAdaptiveScenario = useCallback(
    (scenarioId: string, choiceId: string) => {
      if (!state) return null;
      const result = answerAdaptiveMissionScenario(state, scenarioId, choiceId);
      persist(result.state);
      return result;
    },
    [persist, state]
  );

  const completeAdaptiveMission = useCallback(
    (debrief: string) => {
      if (!state) return null;
      const result = finalizeAdaptiveMission(state, debrief);
      persist(result.state);
      return result;
    },
    [persist, state]
  );

  const dismissAdaptiveMission = useCallback(() => {
    if (!state) return;
    persist(clearAdaptiveMission(state));
  }, [persist, state]);

  const completeOnboarding = useCallback(
    (goal: OnboardingGoal) => {
      if (!state) return;
      persist(completeOnboardingPath(state, goal));
    },
    [persist, state]
  );

  const recordWeeklySession = useCallback(
    (sessionScore: number) => {
      if (!state) return;
      const next = recordWeeklyChallengeSession(state, sessionScore);
      persist(next);
      if (isSignedIn && userId) {
        void fetch("/api/weekly-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionScore: next.weeklyChallenge.bestScore }),
        });
      }
    },
    [isSignedIn, persist, state, userId]
  );

  const setSquadId = useCallback(
    (squadId: string | null) => {
      if (!state) return;
      persist(setSquadMembership(state, squadId));
    },
    [persist, state]
  );

  const completeRepublicSimulator = useCallback(
    (record: {
      scenarioId: string;
      roleId: string;
      fidelityScore: number;
      pointsEarned: number;
    }) => {
      if (!state) return null;
      const result = recordRepublicSimulatorCompletion(state, record);
      persist(result.state);
      return result;
    },
    [persist, state]
  );

  const rank = useMemo(
    () => getRankForScore(state?.defenderScore ?? 0),
    [state?.defenderScore]
  );

  const nextRank = useMemo(() => getNextRank(rank), [rank]);

  const rankProgress = useMemo(
    () => getRankProgress(state?.defenderScore ?? 0, rank, nextRank),
    [state?.defenderScore, rank, nextRank]
  );

  const dailyMission = useMemo(() => {
    if (!state) return null;
    const template = getDailyMissionTemplate(state.dailyMission.missionId);
    return {
      ...template,
      progress: state.dailyMission.progress,
      completed: state.dailyMission.completed,
    };
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      isLoaded,
      defenderScore: state?.defenderScore ?? 0,
      dailyStreak: state?.dailyStreak ?? 0,
      longestStreak: state?.longestStreak ?? 0,
      correctStreak: state?.correctStreak ?? 0,
      rank,
      nextRank,
      rankProgress,
      dailyMission,
      pendingPromotion: state?.pendingPromotionCommentary ?? null,
      grokMissions: state?.grokMissions ?? [],
      adaptiveMission: state?.adaptiveMission ?? null,
      startPersonalizedMission,
      answerAdaptiveScenario,
      completeAdaptiveMission,
      dismissAdaptiveMission,
      recordAnswer,
      logHubActivity,
      dismissPromotion,
      saveGrokMission,
      finishGrokMission,
      completeOnboarding,
      recordWeeklySession,
      setSquadId,
      completeRepublicSimulator,
    }),
    [
      state,
      isLoaded,
      rank,
      nextRank,
      rankProgress,
      dailyMission,
      recordAnswer,
      logHubActivity,
      dismissPromotion,
      saveGrokMission,
      finishGrokMission,
      startPersonalizedMission,
      answerAdaptiveScenario,
      completeAdaptiveMission,
      dismissAdaptiveMission,
      completeOnboarding,
      recordWeeklySession,
      setSquadId,
      completeRepublicSimulator,
    ]
  );

  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);

  if (!context) {
    throw new Error("useProgression must be used within ProgressionProvider");
  }

  return context;
}