"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Landmark,
  Lock,
  Map,
  Swords,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RankBadge } from "@/components/progression/rank-badge";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  getContinueTrainingTarget,
  getLearningPath,
  getLearningPathSummary,
  getTrainingPathCapstoneStatus,
  type PathStep,
  type PathStepStatus,
  type PathUnit,
  type PathUnitStatus,
} from "@/lib/learning-path";
import { PATH_ROUTES } from "@/lib/path-routes";
import type { ProgressionState } from "@/lib/progression";
import { cn } from "@/lib/utils";

const STEP_ICONS = {
  read: BookOpen,
  drill: Target,
  scenario: Swords,
  certify: Award,
} as const;

const UNIT_ACCENT = {
  declaration: {
    border: "border-gold/30",
    glow: "from-gold/[0.08]",
    badge: "border-gold/30 bg-gold/10 text-gold",
    progress: "bg-gold",
    icon: "text-gold",
  },
  constitution: {
    border: "border-constitution-blue/30",
    glow: "from-constitution-blue/[0.08]",
    badge: "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
    progress: "bg-constitution-blue-light",
    icon: "text-constitution-blue-light",
  },
  "bill-of-rights": {
    border: "border-crimson/30",
    glow: "from-crimson/[0.08]",
    badge: "border-crimson/30 bg-crimson/10 text-crimson",
    progress: "bg-crimson",
    icon: "text-crimson",
  },
} as const;

function unitStatusLabel(status: PathUnitStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "locked":
      return "Locked";
  }
}

function stepStatusLabel(status: PathStepStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "available":
      return "Ready";
    case "locked":
      return "Locked";
  }
}

function StepIndicator({ status }: { status: PathStepStatus }) {
  if (status === "complete") {
    return <CheckCircle2 className="size-5 shrink-0 text-gold" />;
  }
  if (status === "in-progress") {
    return (
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
        <Circle className="relative size-5 text-gold" strokeWidth={2.5} />
      </span>
    );
  }
  if (status === "locked") {
    return <Lock className="size-4 shrink-0 text-muted-foreground/70" />;
  }
  return <Circle className="size-5 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />;
}

function PathStepCard({
  step,
  unitLocked,
}: {
  step: PathStep;
  unitLocked: boolean;
}) {
  const Icon = STEP_ICONS[step.id];
  const isLink = !unitLocked && step.status !== "locked";

  const content = (
    <>
      <div className="flex items-start gap-3">
        <StepIndicator status={step.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-navy-border/60 bg-navy/40">
              <Icon className="size-3.5 text-muted-foreground" />
            </span>
            <p className="font-heading text-sm font-semibold tracking-wide text-foreground">
              {step.label}
            </p>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.12em] uppercase",
                step.status === "complete" && "bg-gold/15 text-gold",
                step.status === "in-progress" && "bg-gold/10 text-gold/90",
                step.status === "available" && "bg-navy/50 text-muted-foreground",
                step.status === "locked" && "bg-navy/40 text-muted-foreground/70"
              )}
            >
              {stepStatusLabel(step.status)}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
          {step.progressLabel && (
            <p className="mt-2 text-xs font-medium text-foreground/80">
              {step.progressLabel}
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (!isLink) {
    return (
      <div className="rounded-xl border border-navy-border/50 bg-navy/25 px-4 py-3.5 opacity-80">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={step.href}
      className="block rounded-xl border border-navy-border/60 bg-navy/30 px-4 py-3.5 transition-all hover:border-gold/25 hover:bg-navy-elevated/50"
    >
      {content}
    </Link>
  );
}

function PathUnitCard({ unit, isLast }: { unit: PathUnit; isLast: boolean }) {
  const accent = UNIT_ACCENT[unit.id];
  const unitLocked = unit.status === "locked";

  return (
    <li
      id={`unit-${unit.id}`}
      className="relative flex scroll-mt-24 gap-4 sm:gap-6"
    >
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "absolute left-[1.125rem] top-12 bottom-0 w-px sm:left-[1.375rem]",
            unit.status === "complete" ? "bg-gold/35" : "bg-navy-border/60"
          )}
        />
      )}

      <div className="relative z-10 flex flex-col items-center">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border font-heading text-sm font-bold sm:size-11 sm:text-base",
            unit.status === "complete" && "border-gold/50 bg-gold/15 text-gold",
            unit.status === "in-progress" && accent.badge,
            unit.status === "locked" && "border-navy-border/60 bg-navy/40 text-muted-foreground"
          )}
        >
          {unit.status === "complete" ? (
            <CheckCircle2 className="size-5" />
          ) : unit.status === "locked" ? (
            <Lock className="size-4" />
          ) : (
            unit.order
          )}
        </span>
      </div>

      <article
        className={cn(
          "mb-8 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-gradient-to-b to-navy/50",
          accent.border,
          accent.glow,
          unitLocked ? "opacity-75" : "opacity-100"
        )}
      >
        <div className="border-b border-navy-border/50 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Unit {unit.order}
              </p>
              <h2 className="mt-1 font-heading text-lg font-bold tracking-wide text-foreground sm:text-xl">
                {unit.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{unit.subtitle}</p>
            </div>
            <span
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase",
                unit.status === "complete" && "border-gold/35 bg-gold/10 text-gold",
                unit.status === "in-progress" && accent.badge,
                unit.status === "locked" && "border-navy-border/60 bg-navy/40 text-muted-foreground"
              )}
            >
              {unitStatusLabel(unit.status)}
            </span>
          </div>

          {unit.status !== "locked" && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{unit.certificationTitle}</span>
                <span className="font-semibold text-foreground/90">
                  {unit.overallProgress}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-border/40">
                <div
                  className={cn("h-full rounded-full transition-all", accent.progress)}
                  style={{ width: `${unit.overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {unit.status === "locked" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Complete the prior unit&apos;s certification to unlock this path.
            </p>
          )}
        </div>

        <ol className="space-y-2.5 px-4 py-4 sm:px-5 sm:py-5">
          {unit.steps.map((step) => (
            <li
              key={step.id}
              id={`unit-${unit.id}-step-${step.id}`}
              className="scroll-mt-24"
            >
              <PathStepCard step={step} unitLocked={unitLocked} />
            </li>
          ))}
        </ol>
      </article>
    </li>
  );
}

function resolveDeepLinkTarget(
  units: PathUnit[],
  stepParam: string | null,
  unitParam: string | null
): string | null {
  if (unitParam && stepParam) {
    return `unit-${unitParam}-step-${stepParam}`;
  }

  if (unitParam) {
    return `unit-${unitParam}`;
  }

  if (stepParam) {
    const activeUnit =
      units.find((unit) => unit.status === "in-progress") ??
      units.find((unit) => unit.status !== "locked");
    if (activeUnit) {
      return `unit-${activeUnit.id}-step-${stepParam}`;
    }
  }

  return null;
}

export function PathExperience() {
  const searchParams = useSearchParams();
  const { state, isLoaded, rank, defenderScore } = useProgression();

  const stepParam = searchParams.get("step");
  const unitParam = searchParams.get("unit");

  useEffect(() => {
    if (!isLoaded || !state) return;

    const targetId = resolveDeepLinkTarget(
      getLearningPath(state),
      stepParam,
      unitParam
    );
    if (!targetId) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isLoaded, state, stepParam, unitParam]);

  if (!isLoaded || !state) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 rounded-2xl bg-navy-border/30" />
        <div className="h-64 rounded-2xl bg-navy-border/30" />
        <div className="h-64 rounded-2xl bg-navy-border/30" />
      </div>
    );
  }

  const units = getLearningPath(state);
  const summary = getLearningPathSummary(state);
  const continueTarget = getContinueTrainingTarget(state);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Founding Documents"
        title="Training Path"
        description={`Your sequential journey through the Declaration, Constitution, and Bill of Rights. ${CHARACTER_NAME} tracks your real progress — read, drill, scenario, and certify each unit in order.`}
        aside={
          <div className="flex flex-col items-center gap-3 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
            <RankBadge rank={rank} size="sm" />
            <div className="text-center">
              <p className="font-heading text-xl font-bold text-gold">
                {defenderScore.toLocaleString()}
              </p>
              <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                Defender Score
              </p>
            </div>
          </div>
        }
      />

      <div className="rounded-2xl border border-navy-border/60 bg-navy-elevated/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
              <Map className="size-5 text-gold" />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">
                {summary.completedUnits} of {summary.totalUnits} units complete
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.activeUnit
                  ? `Current focus: ${summary.activeUnit.title}`
                  : "All units complete — hold the line."}
              </p>
            </div>
          </div>
          {!continueTarget.allUnitsComplete && (
            <Button
              nativeButton={false}
              render={<Link href={continueTarget.href} />}
              className="btn-gold h-10 rounded-xl text-sm font-semibold"
            >
              Continue path
            </Button>
          )}
        </div>
      </div>

      <ol className="list-none space-y-0 p-0">
        {units.map((unit, index) => (
          <PathUnitCard
            key={unit.id}
            unit={unit}
            isLast={index === units.length - 1}
          />
        ))}
      </ol>

      <PathCapstoneCard state={state} />
    </div>
  );
}

function PathCapstoneCard({ state }: { state: ProgressionState }) {
  const capstone = getTrainingPathCapstoneStatus(state);
  const unlocked = capstone.complete;

  return (
    <section
      id="capstone-republic-simulator"
      className="scroll-mt-24 rounded-2xl border border-constitution-blue/30 bg-gradient-to-b from-constitution-blue/[0.08] to-navy/50 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              unlocked
                ? "border-constitution-blue/40 bg-constitution-blue/20"
                : "border-navy-border/60 bg-navy/40"
            )}
          >
            {unlocked ? (
              <Landmark className="size-5 text-constitution-blue-light" />
            ) : (
              <Lock className="size-4 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Capstone Challenge
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold tracking-wide text-foreground sm:text-xl">
              Republic Simulator
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {unlocked
                ? "All three units certified. Enter the First Congress for the final Grok-powered decision challenge."
                : "Unlocks when you earn all three founding document certifications. Complete each unit's Read, Drill, Scenario, and Certify steps first."}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase",
            unlocked
              ? "border-constitution-blue/35 bg-constitution-blue/10 text-constitution-blue-light"
              : "border-navy-border/60 bg-navy/40 text-muted-foreground"
          )}
        >
          {unlocked ? "Unlocked" : `${capstone.completedCount}/${capstone.totalCount} certified`}
        </span>
      </div>

      {!unlocked && (
        <ul className="mt-4 space-y-2">
          {capstone.units.map((unit) => (
            <li
              key={unit.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {unit.earned ? (
                <CheckCircle2 className="size-4 text-gold" />
              ) : (
                <Circle className="size-4 text-muted-foreground/50" />
              )}
              <span>{unit.certificationTitle}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        {unlocked ? (
          <Button
            nativeButton={false}
            render={<Link href={PATH_ROUTES.simulator} />}
            className="btn-gold h-10 rounded-xl text-sm font-semibold"
          >
            Enter capstone chamber
          </Button>
        ) : capstone.nextIncompleteUnit ? (
          <Button
            nativeButton={false}
            render={
              <Link href={getContinueTrainingTarget(state).href} />
            }
            className="btn-gold h-10 rounded-xl text-sm font-semibold"
          >
            Continue toward capstone
          </Button>
        ) : null}
      </div>
    </section>
  );
}