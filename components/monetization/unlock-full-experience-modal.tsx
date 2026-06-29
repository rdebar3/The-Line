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
} from "@/lib/subscription";

type UnlockFullExperienceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: () => Promise<void>;
  isPurchasing: boolean;
  purchaseError?: string | null;
  isSignedIn: boolean;
};

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
        className="premium-card max-w-md border-gold/20 bg-navy-elevated/95 p-0 shadow-[0_0_80px_rgba(201,162,39,0.12)] backdrop-blur-md sm:max-w-lg"
      >
        <div className="relative overflow-hidden rounded-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.12)_0%,transparent_60%)]"
          />

          <div className="relative space-y-6 p-6 sm:p-8">
            <DialogHeader className="items-center text-center">
              <GuardianCharacter mood="neutral" size="sm" floating showLabel />
              <DialogTitle className="font-heading text-2xl font-bold tracking-wide text-foreground">
                Unlock Full Experience
              </DialogTitle>
              <DialogDescription className="max-w-sm text-base leading-relaxed text-muted-foreground">
                One-time purchase. Full access to {CHARACTER_NAME} training, all
                scenarios, the Constitutional Arsenal, and unlimited passage
                depth.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-gold/20 bg-navy/60 px-6 py-5 text-center">
              <p className="font-heading text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                One-Time Purchase
              </p>
              <p className="mt-2 font-heading text-4xl font-bold text-foreground">
                {PREMIUM_PRICE_LABEL}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No subscription. Tied to your account forever.
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

            <ul className="max-h-[40vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
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

            <div className="space-y-3 pt-1">
              {purchaseError && (
                <p className="rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-center text-sm text-crimson">
                  {purchaseError}
                </p>
              )}

              {!isSignedIn ? (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    Sign in or create an account to secure your purchase and
                    unlock on any device.
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}