"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Check, Loader2, Lock } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  FREE_VS_PREMIUM_ROWS,
  PREMIUM_FEATURES,
  PREMIUM_PRICE_LABEL,
  UNLOCK_CTA_LABEL,
  VALUE_PROPOSITION,
} from "@/lib/subscription";
import { TRIAL_DAYS } from "@/lib/trial";

type UnlockFullExperienceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: () => Promise<void>;
  isPurchasing: boolean;
  purchaseError?: string | null;
  isSignedIn: boolean;
};

/**
 * Fix: the previous version applied `premium-card` (overflow-hidden) on top
 * of the dialog's own `overflow-y-auto`, so content taller than the viewport
 * was clipped top and bottom with no scrolling. This version keeps one scroll
 * container (the dialog itself) and pins the action buttons in a sticky
 * footer so the CTA is always visible.
 */
export function UnlockFullExperienceModal({
  open,
  onOpenChange,
  onPurchase,
  isPurchasing,
  purchaseError,
  isSignedIn,
}: UnlockFullExperienceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-md gap-0 border border-gold/20 bg-navy-elevated/95 p-0 shadow-[0_0_80px_rgba(201,162,39,0.12)] backdrop-blur-md sm:max-w-lg"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.12)_0%,transparent_70%)]"
        />

        <div className="relative space-y-5 p-6 pb-4 sm:p-8 sm:pb-5">
          <DialogHeader className="items-center text-center">
            <GuardianCharacter mood="neutral" size="sm" floating showLabel />
            <DialogTitle className="font-heading text-2xl font-bold tracking-wide text-foreground">
              Unlock Full Access
            </DialogTitle>
            <DialogDescription className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
              One-time purchase. Full access to {CHARACTER_NAME} training, all
              scenarios, the Republic Simulator, the Constitutional Arsenal,
              and unlimited passage depth.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-gold/20 bg-navy/60 px-5 py-4 text-center sm:px-6 sm:py-5">
            <p className="font-heading text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              One-Time Purchase
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-foreground">
              {PREMIUM_PRICE_LABEL}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No subscription. Tied to your account forever.
            </p>
            {!isSignedIn && (
              <p className="mt-2 text-xs font-medium text-gold">
                New accounts start with {TRIAL_DAYS} days of full access — free.
              </p>
            )}
            <p className="mt-3 rounded-lg border border-gold/20 bg-gold/[0.06] px-3 py-2.5 text-left text-xs leading-relaxed text-muted-foreground">
              {VALUE_PROPOSITION}
            </p>
          </div>

          <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-3">
            <p className="mb-2 text-center text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              What you get vs free
            </p>
            <ul className="space-y-1.5">
              {FREE_VS_PREMIUM_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="shrink-0 text-right font-medium text-gold">
                    {row.full}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="flex gap-3 rounded-xl border border-navy-border/60 bg-navy-elevated/40 px-4 py-3"
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15">
                  <Check className="size-3 text-gold" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky action footer — always visible while the body scrolls */}
        <div className="sticky bottom-0 z-10 space-y-3 rounded-b-xl border-t border-gold/15 bg-navy-elevated/95 px-6 py-4 backdrop-blur-xl sm:px-8">
          {purchaseError && (
            <p className="rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-center text-sm text-crimson">
              {purchaseError}
            </p>
          )}

          {!isSignedIn ? (
            <>
              <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Create a free account to start your {TRIAL_DAYS}-day
                full-access trial — keep everything after with a one-time
                purchase.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <SignInButton mode="redirect">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <Button className="btn-gold w-full">Create Account</Button>
                </SignUpButton>
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={() => void onPurchase()}
                disabled={isPurchasing}
                className="btn-gold btn-cta w-full disabled:opacity-70"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    {UNLOCK_CTA_LABEL}
                  </>
                )}
              </Button>
              <p className="text-center text-[0.65rem] leading-relaxed text-muted-foreground/70">
                Secure Stripe checkout. Premium unlocks on your account.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
