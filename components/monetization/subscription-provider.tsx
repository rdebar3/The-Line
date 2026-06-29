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

async function fetchPremiumStatus(): Promise<PremiumState & { isSignedIn: boolean }> {
  const response = await fetch("/api/purchase");
  if (!response.ok) {
    return { isPremium: false, purchasedAt: null, isSignedIn: false };
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

  const syncPremiumState = useCallback(async () => {
    if (!authLoaded) return;

    if (!isSignedIn) {
      clearPremiumState();
      setState({ isPremium: false, purchasedAt: null });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const remote = await fetchPremiumStatus();

      if (remote.isPremium) {
        writePremiumState(remote.purchasedAt ?? undefined);
        setState({
          isPremium: true,
          purchasedAt: remote.purchasedAt,
        });
      } else {
        clearPremiumState();
        setState({ isPremium: false, purchasedAt: null });
      }
    } catch {
      setState(readPremiumState());
    } finally {
      setIsLoading(false);
    }
  }, [authLoaded, isSignedIn]);

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