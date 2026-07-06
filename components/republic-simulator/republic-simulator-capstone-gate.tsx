"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Landmark, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getContinueTrainingTarget,
  getTrainingPathCapstoneStatus,
} from "@/lib/learning-path";
import { PATH_ROUTES, pathOverviewHref } from "@/lib/path-routes";
import type { ProgressionState } from "@/lib/progression";
import { cn } from "@/lib/utils";

type RepublicSimulatorCapstoneGateProps = {
  state: ProgressionState;
  variant?: "page" | "compact";
};

export function RepublicSimulatorCapstoneGate({
  state,
  variant = "page",
}: RepublicSimulatorCapstoneGateProps) {
  const capstone = getTrainingPathCapstoneStatus(state);
  const continueTarget = getContinueTrainingTarget(state);
  const nextUnit = capstone.nextIncompleteUnit;

  const content = (
    <>
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-constitution-blue/35 bg-constitution-blue/15">
          <Landmark className="size-6 text-constitution-blue-light" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[0.6rem] font-semibold tracking-[0.22em] text-gold uppercase">
            Capstone Challenge
          </p>
          <h2
            className={cn(
              "mt-1 font-heading font-bold tracking-wide text-foreground",
              variant === "page" ? "text-xl" : "text-lg"
            )}
          >
            Republic Simulator Locked
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The Republic Simulator is the final challenge after your training
            path. Earn all three founding document certifications to enter the
            First Congress.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-navy-border/60 bg-navy/35 px-4 py-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Certifications required · {capstone.completedCount} of{" "}
          {capstone.totalCount} earned
        </p>
        <ul className="mt-3 space-y-2.5">
          {capstone.units.map((unit) => (
            <li key={unit.id} className="flex items-start gap-3 text-sm">
              {unit.earned ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
              )}
              <span
                className={cn(
                  unit.earned ? "text-foreground/90" : "text-muted-foreground"
                )}
              >
                <span className="font-medium text-foreground">{unit.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {unit.certificationTitle}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {nextUnit && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Next up: earn{" "}
          <span className="font-semibold text-foreground">
            {nextUnit.certificationTitle}
          </span>{" "}
          by completing Read, Drill, Scenario, and Certify for the{" "}
          {nextUnit.title}.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button
          nativeButton={false}
          render={<Link href={continueTarget.href} />}
          className="btn-gold h-11 flex-1 rounded-xl text-sm font-semibold"
        >
          Continue training path
          <ArrowRight className="size-4" />
        </Button>
        <Button
          nativeButton={false}
          render={
            <Link
              href={
                nextUnit
                  ? pathOverviewHref({ unit: nextUnit.id })
                  : PATH_ROUTES.overview
              }
            />
          }
          variant="outline"
          className="h-11 flex-1 rounded-xl border-navy-border/80"
        >
          View path progress
        </Button>
      </div>
    </>
  );

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-constitution-blue/25 bg-gradient-to-b from-constitution-blue/[0.08] to-navy/50 p-5 sm:p-6">
        {content}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-constitution-blue/30 bg-gradient-to-b from-constitution-blue/[0.08] to-navy-elevated/60 p-6 text-center sm:p-8 sm:text-left">
      <Lock className="mx-auto size-10 text-constitution-blue-light sm:mx-0" />
      {content}
    </div>
  );
}