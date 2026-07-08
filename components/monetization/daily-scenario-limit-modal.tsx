"use client";

import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREMIUM_PRICE_LABEL } from "@/lib/subscription";

type DailyScenarioLimitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => Promise<void>;
  isPurchasing: boolean;
  purchaseError?: string | null;
};

export function DailyScenarioLimitModal({
  open,
  onOpenChange,
  onUnlock,
  isPurchasing,
  purchaseError,
}: DailyScenarioLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-0 border border-gold/20 bg-navy-elevated/95 p-0 shadow-[0_0_60px_rgba(201,162,39,0.1)] backdrop-blur-md sm:max-w-md"
      >
        <div
          aria-hidden
          className="h-0.5 bg-gradient-to-r from-crimson/70 via-gold to-crimson/70"
        />
        <div className="relative space-y-5 p-6 sm:p-7">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-heading text-xl font-bold tracking-wide text-foreground sm:text-2xl">
              Daily limit reached
            </DialogTitle>
            <DialogDescription className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
              You&apos;ve used your 5 free scenarios for today. Ready to
              unlock unlimited access?
            </DialogDescription>
          </DialogHeader>

          {purchaseError && (
            <p className="rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-center text-sm text-crimson">
              {purchaseError}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => void onUnlock()}
              disabled={isPurchasing}
              className="btn-gold btn-cta h-12 w-full gap-2 rounded-xl border border-gold/40 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-base font-bold text-white shadow-[0_4px_30px_rgba(185,28,28,0.35)] hover:from-crimson-hover hover:via-crimson hover:to-gold disabled:opacity-70"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Unlock Full Access — {PREMIUM_PRICE_LABEL} one-time
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPurchasing}
              className="h-10 w-full text-sm text-muted-foreground hover:bg-navy/50 hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
