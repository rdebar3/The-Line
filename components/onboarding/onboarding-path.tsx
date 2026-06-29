"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import {
  ONBOARDING_GOALS,
  type OnboardingGoal,
} from "@/lib/onboarding-path";
import { cn } from "@/lib/utils";

export function OnboardingPath() {
  const { state, completeOnboarding } = useProgression();
  const [selected, setSelected] = useState<OnboardingGoal | null>(null);

  if (!state || state.onboarding.completed) return null;

  const activeGoal =
    ONBOARDING_GOALS.find((g) => g.id === (selected ?? state.onboarding.goal)) ??
    null;

  return (
    <section className="rounded-2xl border border-gold/25 bg-gold/5 p-5 sm:p-6">
      <div className="mb-4 text-center">
        <Target className="mx-auto size-5 text-gold" />
        <h2 className="mt-2 font-heading text-lg font-bold text-foreground">
          60-Second Start
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick your focus — we&apos;ll point you to one drill and one passage.
        </p>
      </div>
      {!activeGoal ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {ONBOARDING_GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelected(goal.id)}
              className={cn(
                "rounded-xl border border-navy-border/70 bg-navy-elevated/50 p-4 text-left transition-all hover:border-gold/30 hover:bg-navy-elevated/80"
              )}
            >
              <p className="font-heading text-sm font-semibold text-foreground">
                {goal.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.description}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="font-heading text-base font-semibold text-foreground">
            {activeGoal.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeGoal.description}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              nativeButton={false}
              render={<Link href={activeGoal.trainingHref} />}
              onClick={() => completeOnboarding(activeGoal.id)}
              className="btn-crimson min-h-10"
            >
              Start drill
              <ArrowRight className="size-4" />
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={activeGoal.documentHref} />}
              onClick={() => completeOnboarding(activeGoal.id)}
              variant="outline"
              className="min-h-10 border-gold/25 text-gold"
            >
              Read passage
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}