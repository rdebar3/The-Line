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

import {
  clearPromotionCommentary,
  completeOnboardingPath,
  getDailyMissionTemplate,
  getNextRank,
  getRankForScore,
  getRankProgress,
  mergeCloudProgressionState,
  recordHubActivity,
  recordScenarioAnswer,
  recordWeeklyChallengeSession,
  addGrokMission,
  completeGrokMission,
  setReminderPreference,
  setSquadMembership,
  type GrokMission,
  type ProgressionState,
} from "@/lib/progression";
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
  setRemindersEnabled: (enabled: boolean) => void;
  setSquadId: (squadId: string | null) => void;
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
      setState(local);
      setIsLoaded(true);
    }

    void hydrate();
  }, [authLoaded, isSignedIn, userId]);

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

  const setRemindersEnabled = useCallback(
    (enabled: boolean) => {
      if (!state) return;
      persist(setReminderPreference(state, enabled));
    },
    [persist, state]
  );

  const setSquadId = useCallback(
    (squadId: string | null) => {
      if (!state) return;
      persist(setSquadMembership(state, squadId));
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
      recordAnswer,
      logHubActivity,
      dismissPromotion,
      saveGrokMission,
      finishGrokMission,
      completeOnboarding,
      recordWeeklySession,
      setRemindersEnabled,
      setSquadId,
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
      completeOnboarding,
      recordWeeklySession,
      setRemindersEnabled,
      setSquadId,
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