"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export function HubHero() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium } = useSubscription();
  const { dailyMission } = useProgression();
  const isGuest = !isLoaded || !isSignedIn;

  const ctaLabel = getTrainingCtaLabel({
    isPremium,
    dailyMission,
    isGuest,
  });

  const showFreeLabel = isGuest || !isPremium;

  return (
    <header className="animate-fade-up text-center">
      <p className="font-heading text-[0.65rem] font-semibold tracking-[0.5em] text-gold uppercase sm:text-xs sm:tracking-[0.55em]">
        Civic Defense Training
      </p>

      <h1 className="hero-title-glow mx-auto mt-4 max-w-4xl font-heading text-[3rem] font-black leading-[0.92] tracking-[0.06em] text-foreground sm:mt-5 sm:text-[4.5rem] sm:tracking-[0.08em] lg:text-[5.5rem]">
        The Line
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-pretty text-lg font-bold leading-snug tracking-wide text-foreground sm:mt-5 sm:text-2xl">
        Know the standard. Hold the line.
      </p>
      <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        Constitutional training for the moment power pushes back.
      </p>

      <div className="mx-auto mt-7 max-w-md sm:mt-8 sm:max-w-lg">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="btn-cta premium-button h-16 w-full gap-3 rounded-2xl border border-gold/45 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark px-8 text-lg font-black tracking-wide text-white shadow-[0_12px_48px_rgba(185,28,28,0.5),0_0_32px_rgba(201,162,39,0.25)] hover:from-crimson-hover hover:via-crimson hover:to-gold sm:h-[4.25rem] sm:text-xl"
          >
            <Shield className="size-6 shrink-0 sm:size-7" strokeWidth={2} />
            {isGuest ? "Start Free Training" : ctaLabel}
            <ArrowRight className="size-6 shrink-0 sm:size-7" strokeWidth={2} />
          </Button>
        </motion.div>

        <Link
          href="/quick-drills"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-gold"
        >
          <Zap className="size-3.5" />
          Or start with Quick Drills
        </Link>

        {showFreeLabel && (
          <p className="mt-4 text-xs font-medium tracking-wide text-gold/90 sm:text-sm">
            {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free scenarios daily — no
            sign-up required
          </p>
        )}
      </div>

      {isSignedIn && isPremium && (
        <div className="mx-auto mt-6 max-w-md">
          <PremiumAccessBanner compact />
        </div>
      )}
    </header>
  );
}