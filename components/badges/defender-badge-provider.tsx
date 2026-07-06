"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DefenderBadgeUnlockModal } from "@/components/badges/defender-badge-unlock-modal";
import { useProgression } from "@/hooks/use-progression";
import type { DocumentSlug } from "@/lib/document-links";
import {
  getDocumentBadgeAchievementId,
  getRankBadgeAchievementId,
  type DefenderBadgeAchievementId,
  type DefenderBadgeRecord,
} from "@/lib/defender-badges";
import type { MilitaryRankId } from "@/lib/progression";

type DefenderBadgeContextValue = {
  badges: DefenderBadgeRecord[];
  isLoaded: boolean;
  refreshBadges: () => Promise<void>;
  requestBadge: (
    achievementId: DefenderBadgeAchievementId,
    options?: { showModal?: boolean; showOnlyIfNew?: boolean }
  ) => Promise<DefenderBadgeRecord | null>;
  requestDocumentBadge: (slug: DocumentSlug) => Promise<void>;
  requestRankBadge: (rankId: MilitaryRankId) => Promise<void>;
};

const DefenderBadgeContext = createContext<DefenderBadgeContextValue | null>(
  null
);

export function useDefenderBadges() {
  const context = useContext(DefenderBadgeContext);
  if (!context) {
    throw new Error("useDefenderBadges must be used within DefenderBadgeProvider.");
  }
  return context;
}

type GenerateResponse = {
  badge?: DefenderBadgeRecord;
  cached?: boolean;
  generated?: boolean;
  error?: string;
};

export function DefenderBadgeProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const { state, defenderScore, pendingPromotion } = useProgression();
  const [badges, setBadges] = useState<DefenderBadgeRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBadge, setModalBadge] = useState<DefenderBadgeRecord | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const inFlightRef = useRef(new Set<string>());
  const shownModalRef = useRef(new Set<string>());
  const rankTriggeredRef = useRef(new Set<string>());

  const refreshBadges = useCallback(async () => {
    if (!isSignedIn) {
      setBadges([]);
      setIsLoaded(true);
      return;
    }

    try {
      const response = await fetch("/api/defender-badges", { cache: "no-store" });
      const data = (await response.json()) as { badges?: DefenderBadgeRecord[] };
      setBadges(data.badges ?? []);
    } catch {
      setBadges([]);
    } finally {
      setIsLoaded(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refreshBadges();
  }, [refreshBadges]);

  const requestBadge = useCallback(
    async (
      achievementId: DefenderBadgeAchievementId,
      options?: { showModal?: boolean; showOnlyIfNew?: boolean }
    ) => {
      if (!isSignedIn) return null;

      const existing = badges.find((badge) => badge.id === achievementId);
      if (existing) {
        if (
          options?.showModal &&
          !options.showOnlyIfNew &&
          !shownModalRef.current.has(achievementId)
        ) {
          shownModalRef.current.add(achievementId);
          setModalBadge(existing);
          setModalError(null);
          setModalLoading(false);
          setModalOpen(true);
        }
        return existing;
      }

      if (inFlightRef.current.has(achievementId)) return null;
      inFlightRef.current.add(achievementId);

      const shouldOpenModal = Boolean(options?.showModal);
      if (shouldOpenModal) {
        setModalBadge(null);
        setModalError(null);
        setModalLoading(true);
        setModalOpen(true);
      }

      try {
        const response = await fetch("/api/defender-badges/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            achievementId,
            defenderScore,
            viewedPassages: state?.viewedPassages,
          }),
        });

        const data = (await response.json()) as GenerateResponse;

        if (!response.ok || !data.badge) {
          const message = data.error ?? "Badge generation failed.";
          if (options?.showModal) {
            setModalError(message);
            setModalLoading(false);
          }
          return null;
        }

        setBadges((current) => {
          const without = current.filter((badge) => badge.id !== data.badge!.id);
          return [...without, data.badge!];
        });

        const showResultModal =
          shouldOpenModal &&
          (!options?.showOnlyIfNew || data.generated);

        if (showResultModal) {
          shownModalRef.current.add(achievementId);
          setModalBadge(data.badge);
          setModalLoading(false);
          setModalOpen(true);
        } else if (shouldOpenModal) {
          setModalOpen(false);
          setModalLoading(false);
        }

        return data.badge;
      } catch {
        if (options?.showModal) {
          setModalError("Badge generation failed. Try again later.");
          setModalLoading(false);
        }
        return null;
      } finally {
        inFlightRef.current.delete(achievementId);
      }
    },
    [badges, defenderScore, isSignedIn, state?.viewedPassages]
  );

  const requestDocumentBadge = useCallback(
    async (slug: DocumentSlug) => {
      await requestBadge(getDocumentBadgeAchievementId(slug), { showModal: true });
    },
    [requestBadge]
  );

  const requestRankBadge = useCallback(
    async (rankId: MilitaryRankId) => {
      if (rankId === "private") return;
      await requestBadge(getRankBadgeAchievementId(rankId), {
        showModal: true,
        showOnlyIfNew: true,
      });
    },
    [requestBadge]
  );

  useEffect(() => {
    if (!isSignedIn || !pendingPromotion || pendingPromotion === "private") {
      return;
    }

    const key = `rank:${pendingPromotion}`;
    if (rankTriggeredRef.current.has(key)) return;
    rankTriggeredRef.current.add(key);

    void requestRankBadge(pendingPromotion);
  }, [isSignedIn, pendingPromotion, requestRankBadge]);

  const value = useMemo(
    () => ({
      badges,
      isLoaded,
      refreshBadges,
      requestBadge,
      requestDocumentBadge,
      requestRankBadge,
    }),
    [
      badges,
      isLoaded,
      refreshBadges,
      requestBadge,
      requestDocumentBadge,
      requestRankBadge,
    ]
  );

  return (
    <DefenderBadgeContext.Provider value={value}>
      {children}
      <DefenderBadgeUnlockModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        badge={modalBadge}
        loading={modalLoading}
        error={modalError}
      />
    </DefenderBadgeContext.Provider>
  );
}