"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { RankBadge } from "@/components/progression/rank-badge";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { buildPerformanceSummary, MILITARY_RANKS } from "@/lib/progression";

export function PromotionOrders() {
  const { canAccess } = useSubscription();
  const { state, pendingPromotion, dismissPromotion } = useProgression();
  const [promotionText, setPromotionText] = useState<string | null>(null);
  const [loadingPromotion, setLoadingPromotion] = useState(false);

  const promotionRank = pendingPromotion
    ? MILITARY_RANKS.find((rank) => rank.id === pendingPromotion) ?? null
    : null;

  const canUseGrok = canAccess("grok_progression");

  useEffect(() => {
    if (!pendingPromotion || !promotionRank) return;

    if (!canUseGrok) {
      setPromotionText(
        `Promotion orders received. You have been advanced to ${promotionRank.title}. Continue your constitutional training — the line depends on prepared defenders.`
      );
      return;
    }

    if (!state) return;

    let cancelled = false;

    async function fetchPromotionCommentary() {
      setLoadingPromotion(true);
      try {
        const response = await fetch("/api/grok/progression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "promotion_commentary",
            performanceSummary: buildPerformanceSummary(state!),
            rankTitle: promotionRank!.title,
            rankAbbreviation: promotionRank!.abbreviation,
          }),
        });

        const data = (await response.json()) as {
          commentary?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load promotion commentary.");
        }

        if (!cancelled) {
          setPromotionText(data.commentary ?? null);
        }
      } catch {
        if (!cancelled) {
          setPromotionText(
            `Promotion orders received. You have been advanced to ${promotionRank!.title}. Continue your constitutional training — the line depends on prepared defenders.`
          );
        }
      } finally {
        if (!cancelled) setLoadingPromotion(false);
      }
    }

    void fetchPromotionCommentary();

    return () => {
      cancelled = true;
    };
  }, [canUseGrok, pendingPromotion, promotionRank, state]);

  if (!pendingPromotion || !promotionRank) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-gold/30 bg-gold/5 p-4 duration-500">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <RankBadge rank={promotionRank} size="sm" celebrate />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-heading text-sm font-semibold tracking-wide text-gold uppercase">
            Promotion Orders
          </p>
          {loadingPromotion ? (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
              <Loader2 className="size-4 animate-spin text-gold" />
              Preparing your promotion address...
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {promotionText}
            </p>
          )}
          {!loadingPromotion && (
            <Button
              size="sm"
              variant="outline"
              onClick={dismissPromotion}
              className="mt-3 min-h-10 border-gold/30 text-gold hover:bg-gold/10"
            >
              Acknowledge Orders
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}