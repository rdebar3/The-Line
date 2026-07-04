"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Medal,
  Shield,
  Swords,
  Trophy,
} from "lucide-react";

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
  readWelcomeOnboardingComplete,
  writeWelcomeOnboardingComplete,
} from "@/lib/onboarding-experience";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "learn",
    step: 1,
    icon: Shield,
    title: "Learn the Standard",
    body: "The Line trains you on the Declaration, Constitution, and Bill of Rights — real scenarios grounded in the founding text.",
    accent: "text-gold border-gold/35 bg-gold/12",
  },
  {
    id: "train",
    step: 2,
    icon: Swords,
    title: "Train Under Pressure",
    body: `${CHARACTER_NAME} walks you through constitutional judgment calls, then delivers a field debrief. Build your Defender Score and earn rank.`,
    accent: "text-crimson-light border-crimson/35 bg-crimson/12",
  },
  {
    id: "grow",
    step: 3,
    icon: Medal,
    title: "Grow as a Defender",
    body: "Save your best Lines, earn certifications, run Quick Drills, and climb the leaderboard as you improve.",
    accent: "text-gold border-gold/35 bg-gold/12",
  },
] as const;

export function WelcomeOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (readWelcomeOnboardingComplete()) return;

    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  function complete() {
    writeWelcomeOnboardingComplete();
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      complete();
      return;
    }
    setOpen(nextOpen);
  }

  const isFinal = step === STEPS.length;
  const current = !isFinal ? STEPS[step] : null;
  const StepIcon = current?.icon ?? Trophy;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="premium-card flex max-h-[min(88dvh,32rem)] min-h-0 w-full flex-col gap-0 overflow-hidden border-gold/25 bg-navy-elevated/95 p-0 shadow-[0_0_60px_rgba(201,162,39,0.15)] backdrop-blur-md sm:max-w-md"
      >
        <div
          aria-hidden
          className="h-0.5 shrink-0 bg-gradient-to-r from-transparent via-gold/65 to-transparent"
        />

        <div className="shrink-0 border-b border-navy-border/50 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading text-[0.6rem] font-semibold tracking-[0.2em] text-gold uppercase">
              {isFinal ? "Ready" : `Step ${step + 1} of ${STEPS.length}`}
            </p>
            <button
              type="button"
              onClick={complete}
              className="text-[0.65rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: STEPS.length + 1 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors duration-300",
                  index <= step ? "bg-gold/70" : "bg-navy-border/60"
                )}
              />
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {!isFinal && current && (
            <div className="space-y-4">
              {step === 0 && (
                <DialogHeader className="items-center text-center">
                  <GuardianCharacter mood="neutral" size="sm" showLabel />
                  <DialogTitle className="font-heading text-xl font-bold tracking-wide text-foreground">
                    Welcome to The Line
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                    Three steps to get oriented — then you&apos;re cleared for
                    training.
                  </DialogDescription>
                </DialogHeader>
              )}

              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    current.accent
                  )}
                >
                  <StepIcon className="size-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold text-foreground">
                    {current.title}
                  </p>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {current.body}
                  </p>
                </div>
              </div>

              {step === 0 && (
                <p className="rounded-lg border border-navy-border/60 bg-navy/35 px-3 py-2.5 text-center text-xs text-muted-foreground">
                  {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free training scenarios
                  per day — no sign-up required.
                </p>
              )}
            </div>
          )}

          {isFinal && (
            <div className="space-y-4 text-center">
              <DialogHeader className="items-center">
                <DialogTitle className="font-heading text-xl font-bold tracking-wide text-foreground">
                  You&apos;re Ready
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  No pressure to be perfect — just show up, learn the standard,
                  and hold the line.
                </DialogDescription>
              </DialogHeader>

              <Button
                nativeButton={false}
                render={<Link href="/rights-under-pressure" />}
                onClick={complete}
                className="btn-cta premium-button h-14 w-full gap-2.5 rounded-2xl border border-gold/40 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark px-6 text-base font-bold tracking-wide text-white shadow-[0_8px_40px_rgba(185,28,28,0.45),0_0_24px_rgba(201,162,39,0.2)] hover:from-crimson-hover hover:via-crimson hover:to-gold sm:h-[3.75rem] sm:text-lg"
              >
                Begin Your Training
                <ArrowRight className="size-5 shrink-0" />
              </Button>

              <button
                type="button"
                onClick={complete}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore the hub first
              </button>
            </div>
          )}
        </div>

        {!isFinal && (
          <div className="flex shrink-0 items-center gap-2 border-t border-navy-border/50 px-4 py-3 sm:px-5">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((value) => value - 1)}
                className="h-9 rounded-lg border-navy-border/70 bg-navy/40 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setStep((value) => value + 1)}
              className="btn-gold h-9 flex-1 rounded-lg text-sm font-semibold"
            >
              {step === STEPS.length - 1 ? "Finish" : "Continue"}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}