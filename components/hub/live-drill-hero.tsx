"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Map,
  Swords,
  Target,
} from "lucide-react";

import { HeroBackground } from "@/components/hub/hero-cinematic/hero-background";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  getContinueTrainingTarget,
  getLearningPathSummary,
  type PathStepId,
} from "@/lib/learning-path";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<PathStepId, typeof BookOpen> = {
  read: BookOpen,
  drill: Target,
  scenario: Swords,
  certify: Award,
};

const UNIT_ACCENT = {
  declaration: "text-gold",
  constitution: "text-constitution-blue-light",
  "bill-of-rights": "text-crimson",
} as const;

function ContinueTrainingCard() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { state, isLoaded: progressionLoaded } = useProgression();
  const isGuest = !authLoaded || !isSignedIn;

  if (!progressionLoaded || !state) {
    return (
      <div
        className="live-drill-panel rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-2xl sm:p-6"
        aria-hidden
      >
        <div className="h-36 animate-pulse rounded-xl bg-navy/40" />
      </div>
    );
  }

  const target = getContinueTrainingTarget(state);
  const summary = getLearningPathSummary(state);
  const StepIcon = STEP_ICONS[target.step.id];
  const unitAccent = UNIT_ACCENT[target.unit.id];

  return (
    <div className="live-drill-panel rounded-2xl border border-white/20 bg-white/[0.1] p-4 backdrop-blur-2xl sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.24em] text-gold uppercase sm:text-xs">
          Continue your training
        </p>
        <Link
          href="/path"
          className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-muted-foreground transition-colors hover:text-gold"
        >
          <Map className="size-3" />
          Full path
        </Link>
      </div>

      {target.allUnitsComplete ? (
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <span className="flex size-11 items-center justify-center rounded-xl border border-gold/35 bg-gold/15">
              <CheckCircle2 className="size-5 text-gold" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-base font-bold tracking-wide text-foreground sm:text-lg">
                {target.headline}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {target.detail}
              </p>
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/path" />}
            className="btn-gold btn-cta h-12 w-full rounded-xl text-sm font-semibold shadow-[0_0_28px_rgba(201,162,39,0.25)]"
          >
            View training path
            <ArrowRight className="size-4 shrink-0" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-navy/45">
              <StepIcon className={cn("size-5", unitAccent)} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Unit {target.unit.order} · {target.step.label}
              </p>
              <p className="mt-1 font-heading text-base font-bold leading-snug tracking-wide text-foreground sm:text-lg">
                {target.headline}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {target.detail}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/90">
                {summary.completedUnits} of {summary.totalUnits} units certified
              </p>
            </div>
          </div>

          <Button
            nativeButton={false}
            render={<Link href={target.href} />}
            className="btn-crimson btn-cta h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_24px_rgba(185,28,28,0.25)]"
          >
            Continue {target.step.label.toLowerCase()}
            <ArrowRight className="size-4 shrink-0" />
          </Button>

          {isGuest && (
            <Link
              href="/sign-up"
              className="block text-center text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Create a free account to save your Defender Score and path progress.
            </Link>
          )}

          {!isGuest && (
            <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
              <span className="font-semibold text-foreground/90">
                {CHARACTER_NAME}
              </span>{" "}
              routes you through Read, Drill, Scenario, and Certify for each
              founding document.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function LiveDrillHero() {
  return (
    <header className="hub-live-drill-hero relative isolate w-full overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="live-drill-title font-heading font-black leading-none tracking-[0.02em]">
            <span className="live-drill-title-pre">The</span>
            <span className="live-drill-title-main">Line</span>
          </h1>
          <p className="live-drill-tagline mt-2 text-sm font-bold text-foreground sm:text-base">
            Know the standard. Hold the line.
          </p>
        </div>

        <div className="mx-auto mt-5 max-w-xl sm:mt-6">
          <ContinueTrainingCard />
        </div>
      </div>
    </header>
  );
}