"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { UnlockFullExperienceModal } from "@/components/monetization/unlock-full-experience-modal";
import {
  getOptimisticPremiumState,
  readClerkPremiumState,
  type PremiumMetadata,
} from "@/lib/premium-status";
import {
  clearPremiumState,
  hasFeature,
  readPremiumState,
  writePremiumState,
  type PremiumFeature,
  type PremiumState,
} from "@/lib/subscription";

type SubscriptionContextValue = {
  isPremium: boolean;
  purchasedAt: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isModalOpen: boolean;
  isPurchasing: boolean;
  purchaseError: string | null;
  justUnlocked: boolean;
  openUnlockModal: () => void;
  closeUnlockModal: () => void;
  unlock: () => Promise<void>;
  canAccess: (feature: PremiumFeature) => boolean;
  clearUnlockCelebration: () => void;
};

export const SubscriptionContext =
  createContext<SubscriptionContextValue | null>(null);

async function fetchPremiumStatus(): Promise<
  PremiumState & { isSignedIn: boolean }
> {
  const response = await fetch("/api/purchase", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Premium status fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    isPremium?: boolean;
    purchasedAt?: string | null;
    isSignedIn?: boolean;
  };

  return {
    isPremium: Boolean(data.isPremium),
    purchasedAt: data.purchasedAt ?? null,
    isSignedIn: Boolean(data.isSignedIn),
  };
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<PremiumState>({
    isPremium: false,
    purchasedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const clerkPremium = useMemo(
    () =>
      readClerkPremiumState(user?.publicMetadata as PremiumMetadata | undefined),
    [user?.publicMetadata]
  );

  const syncPremiumState = useCallback(async () => {
    if (!authLoaded) return;

    if (!isSignedIn) {
      clearPremiumState();
      setState({ isPremium: false, purchasedAt: null });
      setIsLoading(false);
      return;
    }

    const optimistic = getOptimisticPremiumState(
      clerkPremium,
      readPremiumState()
    );

    if (optimistic.isPremium) {
      setState(optimistic);
    }

    setIsLoading(true);

    try {
      const remote = await fetchPremiumStatus();

      if (!remote.isSignedIn) {
        setState({ isPremium: false, purchasedAt: null });
        clearPremiumState();
        return;
      }

      const resolved: PremiumState = {
        isPremium: remote.isPremium,
        purchasedAt: remote.purchasedAt,
      };

      setState(resolved);

      if (resolved.isPremium) {
        writePremiumState(resolved.purchasedAt ?? undefined);
      } else {
        clearPremiumState();
      }
    } catch {
      const fallback = getOptimisticPremiumState(
        clerkPremium,
        readPremiumState()
      );
      setState(fallback);

      if (fallback.isPremium) {
        writePremiumState(fallback.purchasedAt ?? undefined);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authLoaded, isSignedIn, clerkPremium]);

  useEffect(() => {
    void syncPremiumState();
  }, [syncPremiumState, userId]);

  useEffect(() => {
    function handlePremiumUnlocked() {
      void (async () => {
        await user?.reload();
        await syncPremiumState();
        setJustUnlocked(true);
        setIsModalOpen(false);
      })();
    }

    window.addEventListener("theline:premium-unlocked", handlePremiumUnlocked);
    return () => {
      window.removeEventListener(
        "theline:premium-unlocked",
        handlePremiumUnlocked
      );
    };
  }, [syncPremiumState, user]);

  const openUnlockModal = useCallback(() => {
    setPurchaseError(null);
    setIsModalOpen(true);
  }, []);

  const closeUnlockModal = useCallback(() => setIsModalOpen(false), []);

  const clearUnlockCelebration = useCallback(() => setJustUnlocked(false), []);

  const unlock = useCallback(async () => {
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      );
      window.location.assign(`/sign-in?redirect_url=${returnUrl}`);
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Purchase failed");
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("Checkout URL was not returned.");
    } catch (err) {
      setPurchaseError(
        err instanceof Error
          ? err.message
          : "Purchase could not be completed. Please try again in a moment."
      );
      setIsPurchasing(false);
    }
  }, [isSignedIn]);

  const canAccess = useCallback(
    (feature: PremiumFeature) => hasFeature(state.isPremium, feature),
    [state.isPremium]
  );

  const value = useMemo(
    () => ({
      isPremium: state.isPremium,
      purchasedAt: state.purchasedAt,
      isLoading: !authLoaded || isLoading,
      isSignedIn: Boolean(isSignedIn),
      isModalOpen,
      isPurchasing,
      purchaseError,
      justUnlocked,
      openUnlockModal,
      closeUnlockModal,
      unlock,
      canAccess,
      clearUnlockCelebration,
    }),
    [
      state.isPremium,
      state.purchasedAt,
      authLoaded,
      isLoading,
      isSignedIn,
      isModalOpen,
      isPurchasing,
      purchaseError,
      justUnlocked,
      openUnlockModal,
      closeUnlockModal,
      unlock,
      canAccess,
      clearUnlockCelebration,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <UnlockFullExperienceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onPurchase={unlock}
        isPurchasing={isPurchasing}
        purchaseError={purchaseError}
        isSignedIn={Boolean(isSignedIn)}
      />
    </SubscriptionContext.Provider>
  );
}