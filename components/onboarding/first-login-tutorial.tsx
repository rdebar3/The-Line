"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Medal,
  MessageSquare,
  Shield,
  Sparkles,
  Swords,
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
import { useSubscription } from "@/hooks/use-subscription";
import type { UserPublicMetadata } from "@/lib/clerk-onboarding";
import {
  readLocalFirstLoginTutorialComplete,
  writeLocalFirstLoginTutorialComplete,
} from "@/lib/first-login-tutorial";
import { CHARACTER_NAME } from "@/lib/guardian";
import { FREE_GROK_DAILY_LIMIT } from "@/lib/grok-teaser";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { PREMIUM_PRICE_LABEL } from "@/lib/subscription";
import { cn } from "@/lib/utils";

const JOURNEY_STEPS = [
  {
    id: "track",
    label: "Track",
    title: "Track Your Defender Score",
    icon: Medal,
    accent: "text-gold border-gold/35 bg-gold/12",
    connector: "text-gold",
    body: "Your score, streaks, rank, and daily missions live on the hub — so you always know where you stand.",
    free: "Progress tracking is always free.",
    unlock: "Unlock adds tactical drills and rank debriefs.",
  },
  {
    id: "train",
    label: "Train",
    title: "Train Under Pressure",
    icon: Swords,
    accent: "text-crimson border-crimson/35 bg-crimson/12",
    connector: "text-crimson",
    body: "Constitutional scenarios test your judgment under pressure, then deliver a field debrief.",
    free: `${FREE_DAILY_SCENARIO_GENERATION_LIMIT} scenarios/day free.`,
    unlock: "Unlock for unlimited, rank-scaled sessions.",
  },
  {
    id: "study",
    label: "Study",
    title: "Study the Documents",
    icon: BookOpen,
    accent:
      "text-constitution-blue-light border-constitution-blue/35 bg-constitution-blue/12",
    connector: "text-constitution-blue-light",
    body: "Read the Declaration, Constitution, and Bill of Rights with context you can use.",
    free: "3 passages per document free.",
    unlock: "Unlock for every passage, full depth.",
  },
  {
    id: "ask",
    label: "Ask",
    title: `Ask ${CHARACTER_NAME}`,
    icon: MessageSquare,
    accent: "text-gold border-gold/35 bg-gold/12",
    connector: "text-gold",
    body: "Get constitutional counsel grounded in the founding record — not generic advice.",
    free: `${FREE_GROK_DAILY_LIMIT} questions/day free.`,
    unlock: "Unlock for unlimited counsel and tactical missions.",
  },
] as const;

const STEP_LABELS = ["Welcome", ...JOURNEY_STEPS.map((s) => s.label)] as const;

type JourneyStep = (typeof JOURNEY_STEPS)[number];

function JourneyStepPanel({
  step,
  isPremium,
}: {
  step: JourneyStep;
  isPremium: boolean;
}) {
  const StepIcon = step.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border",
            step.accent
          )}
        >
          <StepIcon className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              "font-heading text-[0.6rem] font-bold tracking-[0.18em] uppercase",
              step.connector
            )}
          >
            {step.label}
          </p>
          <DialogTitle className="mt-0.5 font-heading text-base font-bold tracking-wide text-foreground">
            {step.title}
          </DialogTitle>
        </div>
      </div>

      <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {step.body}
      </p>

      <div className="rounded-lg border border-navy-border/60 bg-navy/35 px-3 py-2.5 text-xs leading-relaxed">
        <p className="text-foreground/85">
          <span className="font-semibold text-muted-foreground">Free: </span>
          {step.free}
        </p>
        {!isPremium && (
          <p className="mt-1.5 text-gold/90">
            <span className="font-semibold text-gold">
              Full ({PREMIUM_PRICE_LABEL}):{" "}
            </span>
            {step.unlock}
          </p>
        )}
      </div>
    </div>
  );
}

export function FirstLoginTutorial() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { isPremium, openUnlockModal } = useSubscription();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const lastCheckedUserIdRef = useRef<string | null>(null);

  const totalSteps = JOURNEY_STEPS.length + 1;
  const isWelcome = step === 0;
  const isFinal = step === JOURNEY_STEPS.length;
  const journeyStep = isWelcome || isFinal ? null : JOURNEY_STEPS[step - 1];

  const markComplete = useCallback(async () => {
    if (!userId || isCompleting) return;

    setIsCompleting(true);
    writeLocalFirstLoginTutorialComplete(userId);
    setOpen(false);

    try {
      await fetch("/api/user/onboarding", { method: "POST" });
      await user?.reload();
    } catch {
      // localStorage fallback already recorded completion
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleting, user, userId]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      setOpen(false);
      lastCheckedUserIdRef.current = null;
      return;
    }

    if (lastCheckedUserIdRef.current === userId) return;
    lastCheckedUserIdRef.current = userId;

    async function evaluate() {
      if (readLocalFirstLoginTutorialComplete(userId!)) {
        setOpen(false);
        return;
      }

      const metadata = user?.publicMetadata as UserPublicMetadata | undefined;
      if (metadata?.firstLoginTutorialCompleted) {
        writeLocalFirstLoginTutorialComplete(userId!);
        setOpen(false);
        return;
      }

      try {
        const response = await fetch("/api/user/onboarding");
        if (response.ok) {
          const data = (await response.json()) as { completed?: boolean };
          if (data.completed) {
            writeLocalFirstLoginTutorialComplete(userId!);
            setOpen(false);
            return;
          }
        }
      } catch {
        // Fall through to showing the tutorial
      }

      setStep(0);
      setOpen(true);
    }

    void evaluate();
  }, [isLoaded, isSignedIn, user?.publicMetadata, userId]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      void markComplete();
      return;
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="premium-card flex max-h-[min(88dvh,34rem)] min-h-0 w-full flex-col gap-0 overflow-hidden border-gold/25 bg-navy-elevated/95 p-0 shadow-[0_0_60px_rgba(201,162,39,0.15)] backdrop-blur-md sm:max-w-md"
      >
        <div
          aria-hidden
          className="h-0.5 shrink-0 bg-gradient-to-r from-transparent via-gold/65 to-transparent"
        />

        {/* Progress — fixed */}
        <div className="shrink-0 border-b border-navy-border/50 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading text-[0.6rem] font-semibold tracking-[0.2em] text-gold uppercase">
              {isWelcome
                ? "Field Briefing"
                : isFinal
                  ? "Mission Ready"
                  : `Step ${step} of ${JOURNEY_STEPS.length}`}
            </p>
            <p className="text-[0.6rem] text-muted-foreground/70">
              {STEP_LABELS[step]}
            </p>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
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

        {/* Body — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {isWelcome && (
            <div className="space-y-3.5">
              <DialogHeader className="items-center text-center">
                <GuardianCharacter mood="neutral" size="sm" showLabel />
                <DialogTitle className="font-heading text-lg font-bold tracking-wide text-foreground">
                  Welcome to The Line
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  I&apos;m {CHARACTER_NAME}. Train on the founding text, track
                  your progress, and build judgment before the moment finds you.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2">
                {JOURNEY_STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-navy-border/60 bg-navy/35 p-2.5"
                    >
                      <span
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-md border",
                          item.accent
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={1.75} />
                      </span>
                      <p className="mt-1.5 font-heading text-[0.65rem] font-semibold leading-snug text-foreground">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[0.65rem] text-muted-foreground">
                Four steps · About a minute
              </p>
            </div>
          )}

          {journeyStep && (
            <JourneyStepPanel step={journeyStep} isPremium={isPremium} />
          )}

          {isFinal && (
            <div className="space-y-3.5">
              <DialogHeader className="items-center text-center">
                <DialogTitle className="font-heading text-lg font-bold tracking-wide text-foreground">
                  You&apos;re Cleared for Training
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Track → Train → Study → Ask. Start with your first mission.
                </DialogDescription>
              </DialogHeader>

              {!isPremium ? (
                <div className="rounded-lg border border-gold/25 bg-gold/[0.07] px-3 py-3 text-center">
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {PREMIUM_PRICE_LABEL}
                  </p>
                  <p className="mt-1 text-pretty text-[0.7rem] leading-relaxed text-muted-foreground">
                    One-time unlock for unlimited training, counsel, and full
                    document depth.
                  </p>
                  <button
                    type="button"
                    onClick={() => openUnlockModal()}
                    className="mt-2 text-[0.65rem] font-semibold text-gold hover:underline"
                  >
                    See Full Access details
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-gold/25 bg-gold/10 px-3 py-2.5 text-xs text-gold">
                  <Sparkles className="size-3.5 shrink-0" />
                  Full access active
                </div>
              )}

              <Button
                nativeButton={false}
                render={<Link href="/rights-under-pressure" />}
                onClick={() => void markComplete()}
                className="btn-crimson h-11 w-full rounded-xl text-sm font-semibold"
              >
                <Shield className="size-4 shrink-0" />
                Start My First Training Mission
              </Button>
              <button
                type="button"
                onClick={() => void markComplete()}
                className="w-full text-center text-[0.65rem] text-muted-foreground hover:text-foreground"
              >
                Explore the hub first
              </button>
            </div>
          )}
        </div>

        {/* Footer nav — fixed */}
        {!isFinal && (
          <div className="flex shrink-0 items-center gap-2 border-t border-navy-border/50 px-4 py-3 sm:px-5">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="h-9 rounded-lg border-navy-border/70 bg-navy/40 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-gold h-9 flex-1 rounded-lg text-sm font-semibold"
            >
              {isWelcome ? "Begin" : "Continue"}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}