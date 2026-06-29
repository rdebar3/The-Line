"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";
import { UNLOCK_FULL_LABEL } from "@/lib/subscription";

export function PremiumCta() {
  const { isPremium, openUnlockModal } = useSubscription();

  if (isPremium) {
    return (
      <section className="mt-12 flex animate-fade-up-delay-4 flex-col items-center sm:mt-16 lg:mt-20">
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/arsenal" />}
            variant="outline"
            className="premium-button h-12 rounded-xl border-gold/30 bg-navy-elevated/60 px-6 text-gold hover:border-gold/50 hover:bg-gold/10"
          >
            Constitutional Arsenal
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/declaration" />}
            className="btn-gold h-12 rounded-xl px-6"
          >
            Study Founding Documents
          </Button>
        </div>
        <p className="mt-4 flex max-w-md items-center justify-center gap-2 px-2 text-center text-xs text-muted-foreground sm:text-sm">
          <Sparkles className="size-3.5 shrink-0 text-gold" />
          Premium active — {CHARACTER_NAME} training, all scenarios, and full
          passage depth unlocked.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 flex animate-fade-up-delay-4 flex-col items-center">
      <Button
        onClick={openUnlockModal}
        className="btn-gold btn-cta h-12 w-full max-w-sm rounded-xl text-base font-semibold"
      >
        <Lock className="size-4" />
        {UNLOCK_FULL_LABEL}
      </Button>
      <p className="mt-2 max-w-sm text-center text-xs text-muted-foreground">
        {FREE_DAILY_SCENARIO_GENERATION_LIMIT} scenarios/day free · Unlock for
        unlimited training, {CHARACTER_NAME}, and the Arsenal
      </p>
    </section>
  );
}