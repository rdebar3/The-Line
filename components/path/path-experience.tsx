"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Feather,
  Landmark,
  Lock,
  Map,
  Scale,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RankBadge } from "@/components/progression/rank-badge";
import { Button } from "@/components/ui/button";
import {
  GoldProgressBar,
  PATH_STEP_ICONS,
  PathStatusDot,
  ProgressRing,
} from "@/components/ui/visual-nav";
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

const UNIT_META = {
  declaration: {
    border: "border-[rgba(197,164,110,0.28)]",
    glow: "from-[rgba(197,164,110,0.08)]",
    badge: "border-[rgba(197,164,110,0.3)] bg-[rgba(197,164,110,0.1)] text-[#C5A46E]",
    progress: "bg-[#C5A46E]",
    iconWrap: "border-[rgba(197,164,110,0.35)] bg-[rgba(197,164,110,0.12)] text-[#C5A46E]",
    Icon: Feather,
  },
  constitution: {
    border: "border-constitution-blue/30",
    glow: "from-constitution-blue/[0.08]",
    badge:
      "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
    progress: "bg-constitution-blue-light",
    iconWrap:
      "border-constitution-blue/35 bg-constitution-blue/12 text-constitution-blue-light",
    Icon: Landmark,
  },
  "bill-of-rights": {
    border: "border-crimson/30",
    glow: "from-crimson/[0.08]",
    badge: "border-crimson/30 bg-crimson/10 text-crimson",
    progress: "bg-crimson",
    iconWrap: "border-crimson/35 bg-crimson/12 text-crimson",
    Icon: Scale,
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

function PathStepCard({
  step,
  unitLocked,
  isLast,
}: {
  step: PathStep;
  unitLocked: boolean;
  isLast: boolean;
}) {
  const Icon = PATH_STEP_ICONS[step.id] ?? BookOpen;
  const isLink = !unitLocked && step.status !== "locked";

  const content = (
    <div className="flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        <PathStatusDot status={step.status} />
        {!isLast && (
          <span
            aria-hidden
            className={cn(
              "mt-1 w-px flex-1 min-h-[1.25rem]",
              step.status === "complete"
                ? "bg-[rgba(197,164,110,0.35)]"
                : "bg-[rgba(245,241,233,0.08)]"
            )}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-xl border transition-colors",
              step.status === "complete"
                ? "border-[rgba(197,164,110,0.4)] bg-[rgba(197,164,110,0.12)] text-[#C5A46E]"
                : step.status === "in-progress"
                  ? "border-[rgba(197,164,110,0.3)] bg-[rgba(197,164,110,0.08)] text-[#C5A46E]"
                  : "border-navy-border/60 bg-navy/40 text-muted-foreground"
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
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
  );

  if (!isLink) {
    return (
      <div className="rounded-xl border border-navy-border/40 bg-navy/20 px-3.5 py-3 opacity-85 sm:px-4">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={step.href}
      className="block rounded-xl border border-navy-border/55 bg-navy/25 px-3.5 py-3 transition-all hover:border-gold/25 hover:bg-navy-elevated/45 sm:px-4"
    >
      {content}
    </Link>
  );
}

/** Horizontal mini-step rail for quick scanning inside a unit. */
function UnitStepRail({ steps }: { steps: PathStep[] }) {
  return (
    <ol className="mt-4 flex items-center gap-0 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const Icon = PATH_STEP_ICONS[step.id] ?? BookOpen;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center gap-1.5 px-0.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border transition-colors",
                  step.status === "complete" &&
                    "border-gold/50 bg-gold/15 text-gold",
                  step.status === "in-progress" &&
                    "border-gold/40 bg-gold/10 text-gold shadow-[0_0_12px_rgba(197,164,110,0.2)]",
                  step.status === "available" &&
                    "border-navy-border/70 bg-navy/40 text-muted-foreground",
                  step.status === "locked" &&
                    "border-navy-border/50 bg-navy/30 text-muted-foreground/50"
                )}
                title={`${step.label}: ${stepStatusLabel(step.status)}`}
              >
                {step.status === "locked" ? (
                  <Lock className="size-3.5" />
                ) : step.status === "complete" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Icon className="size-3.5" strokeWidth={1.75} />
                )}
              </span>
              <span className="hidden text-center text-[0.6rem] font-medium tracking-wide text-muted-foreground sm:block">
                {step.label.replace(/^Step \d+:\s*/i, "").split(" ")[0]}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mb-5 hidden h-px min-w-[0.75rem] flex-1 sm:block",
                  step.status === "complete"
                    ? "bg-gold/40"
                    : "bg-navy-border/50"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function PathUnitCard({ unit, isLast }: { unit: PathUnit; isLast: boolean }) {
  const meta = UNIT_META[unit.id];
  const UnitIcon = meta.Icon;
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
            "absolute left-[1.125rem] top-14 bottom-0 w-px sm:left-[1.375rem]",
            unit.status === "complete" ? "bg-gold/35" : "bg-navy-border/55"
          )}
        />
      )}

      <div className="relative z-10 flex flex-col items-center pt-1">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border sm:size-11",
            unit.status === "complete" && "border-gold/50 bg-gold/15 text-gold",
            unit.status === "in-progress" && meta.iconWrap,
            unit.status === "locked" &&
              "border-navy-border/60 bg-navy/40 text-muted-foreground"
          )}
        >
          {unit.status === "complete" ? (
            <CheckCircle2 className="size-5" />
          ) : unit.status === "locked" ? (
            <Lock className="size-4" />
          ) : (
            <UnitIcon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
          )}
        </span>
      </div>

      <article
        className={cn(
          "mb-8 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-gradient-to-b to-navy/50",
          meta.border,
          meta.glow,
          unitLocked ? "opacity-75" : "opacity-100"
        )}
      >
        <div className="border-b border-navy-border/50 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border",
                  unit.status === "locked"
                    ? "border-navy-border/50 bg-navy/40 text-muted-foreground"
                    : meta.iconWrap
                )}
              >
                <UnitIcon className="size-4" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Unit {unit.order}
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold tracking-wide text-foreground sm:text-xl">
                  {unit.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{unit.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unit.status !== "locked" && (
                <ProgressRing
                  value={unit.overallProgress}
                  size={44}
                  strokeWidth={2.75}
                  label={`${unit.overallProgress}% of ${unit.title}`}
                >
                  <span className="font-heading text-[0.65rem] font-semibold tabular-nums text-gold">
                    {unit.overallProgress}
                    <span className="text-[0.5rem] opacity-70">%</span>
                  </span>
                </ProgressRing>
              )}
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase",
                  unit.status === "complete" && "border-gold/35 bg-gold/10 text-gold",
                  unit.status === "in-progress" && meta.badge,
                  unit.status === "locked" &&
                    "border-navy-border/60 bg-navy/40 text-muted-foreground"
                )}
              >
                {unitStatusLabel(unit.status)}
              </span>
            </div>
          </div>

          {unit.status !== "locked" && (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Award className="size-3.5 text-gold/80" strokeWidth={1.75} />
                  {unit.certificationTitle}
                </span>
                <span className="font-semibold text-foreground/90">
                  {unit.overallProgress}%
                </span>
              </div>
              <GoldProgressBar
                value={unit.overallProgress}
                className="mt-2 h-1.5"
                fillClassName={cn(
                  unit.id === "constitution" &&
                    "!bg-gradient-to-r !from-constitution-blue !via-constitution-blue-light !to-constitution-blue",
                  unit.id === "bill-of-rights" &&
                    "!bg-gradient-to-r !from-crimson !via-crimson-light !to-crimson"
                )}
              />
              <UnitStepRail steps={unit.steps} />
            </div>
          )}

          {unit.status === "locked" && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Complete the prior unit&apos;s certification to unlock this path.
            </p>
          )}
        </div>

        <ol className="space-y-2 px-4 py-4 sm:px-5 sm:py-5">
          {unit.steps.map((step, index) => (
            <li
              key={step.id}
              id={`unit-${unit.id}-step-${step.id}`}
              className="scroll-mt-24"
            >
              <PathStepCard
                step={step}
                unitLocked={unitLocked}
                isLast={index === unit.steps.length - 1}
              />
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
  const overallPct = Math.round(
    (summary.completedUnits / Math.max(1, summary.totalUnits)) * 100
  );

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

      {/* Path overview strip */}
      <div className="rounded-2xl border border-navy-border/60 bg-navy-elevated/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ProgressRing
              value={overallPct}
              size={48}
              strokeWidth={3}
              label={`${summary.completedUnits} of ${summary.totalUnits} units complete`}
            >
              <Map className="size-4 text-gold" strokeWidth={1.75} />
            </ProgressRing>
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

        {/* Visual unit milestones */}
        <ol className="mt-5 flex items-center justify-between gap-2 border-t border-navy-border/40 pt-5">
          {units.map((unit, index) => {
            const meta = UNIT_META[unit.id];
            const Icon = meta.Icon;
            return (
              <li key={unit.id} className="flex min-w-0 flex-1 items-center">
                <a
                  href={`#unit-${unit.id}`}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-90"
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border sm:size-10",
                      unit.status === "complete" &&
                        "border-gold/50 bg-gold/15 text-gold",
                      unit.status === "in-progress" && meta.iconWrap,
                      unit.status === "locked" &&
                        "border-navy-border/55 bg-navy/35 text-muted-foreground/60"
                    )}
                  >
                    {unit.status === "locked" ? (
                      <Lock className="size-3.5" />
                    ) : unit.status === "complete" ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    )}
                  </span>
                  <span className="max-w-full truncate text-center text-[0.6rem] font-medium tracking-wide text-muted-foreground sm:text-[0.65rem]">
                    {unit.id === "bill-of-rights"
                      ? "Bill of Rights"
                      : unit.id === "constitution"
                        ? "Constitution"
                        : "Declaration"}
                  </span>
                </a>
                {index < units.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "mb-5 h-px w-3 shrink-0 sm:w-6",
                      unit.status === "complete" ? "bg-gold/40" : "bg-navy-border/50"
                    )}
                  />
                )}
              </li>
            );
          })}
          <li className="flex min-w-0 items-center">
            <span
              aria-hidden
              className={cn(
                "mb-5 h-px w-3 shrink-0 sm:w-6",
                summary.completedUnits === summary.totalUnits
                  ? "bg-gold/40"
                  : "bg-navy-border/50"
              )}
            />
            <div className="flex flex-col items-center gap-1.5 px-1">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border sm:size-10",
                  getTrainingPathCapstoneStatus(state).complete
                    ? "border-constitution-blue/40 bg-constitution-blue/15 text-constitution-blue-light"
                    : "border-navy-border/55 bg-navy/35 text-muted-foreground/60"
                )}
              >
                <Landmark className="size-3.5" strokeWidth={1.75} />
              </span>
              <span className="text-center text-[0.6rem] font-medium tracking-wide text-muted-foreground sm:text-[0.65rem]">
                Capstone
              </span>
            </div>
          </li>
        </ol>
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
  const capstonePct = Math.round(
    (capstone.completedCount / Math.max(1, capstone.totalCount)) * 100
  );

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
        <div className="flex items-center gap-3">
          <ProgressRing
            value={capstonePct}
            size={44}
            strokeWidth={2.75}
            label={`${capstone.completedCount} of ${capstone.totalCount} certifications`}
            fillClassName="stroke-constitution-blue-light"
            trackClassName="stroke-constitution-blue/20"
          >
            <span className="font-heading text-[0.6rem] font-semibold tabular-nums text-constitution-blue-light">
              {capstone.completedCount}/{capstone.totalCount}
            </span>
          </ProgressRing>
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
      </div>

      {!unlocked && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {capstone.units.map((unit) => (
            <li
              key={unit.id}
              className="flex items-center gap-2 rounded-xl border border-navy-border/40 bg-navy/25 px-3 py-2.5 text-sm text-muted-foreground"
            >
              {unit.earned ? (
                <CheckCircle2 className="size-4 shrink-0 text-gold" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span className="min-w-0 truncate">{unit.certificationTitle}</span>
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
            render={<Link href={getContinueTrainingTarget(state).href} />}
            className="btn-gold h-10 rounded-xl text-sm font-semibold"
          >
            Continue toward capstone
          </Button>
        ) : null}
      </div>
    </section>
  );
}
