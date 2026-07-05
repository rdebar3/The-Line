"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const ease = [0.22, 1, 0.36, 1] as const;

type HeroPanelProps = {
  reducedMotion?: boolean;
};

export function HeroPanel({ reducedMotion = false }: HeroPanelProps) {
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
  const buttonLabel = isGuest ? "Start Free Training" : ctaLabel;

  return (
    <motion.div
      className="hub-hero-cinematic-panel"
      initial={reducedMotion ? false : { opacity: 0, y: 28, x: 16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.85, ease }}
    >
      <div className="hub-hero-cinematic-eyebrow">
        <span className="hub-hero-cinematic-live" />
        <Radio className="size-3 text-crimson-hover" />
        <span>Constitutional Command Center</span>
        <span className="hub-hero-cinematic-sep" />
        <span className="text-gold/90">America 250</span>
      </div>

      <h1 className="hub-hero-cinematic-title">
        <span className="hub-hero-cinematic-title-pre">The</span>
        <span className="hub-hero-cinematic-title-main">Line</span>
      </h1>

      <p className="hub-hero-cinematic-tagline">
        Know the standard. Hold the line.
      </p>

      <p className="hub-hero-cinematic-copy">
        AI-powered civic defense — founding documents, live scenarios, and
        constitutional training for America&apos;s 250th year.
      </p>

      <motion.div
        whileHover={reducedMotion ? undefined : { scale: 1.03 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      >
        <Button
          nativeButton={false}
          render={<Link href="/rights-under-pressure" />}
          className="hub-hero-cinematic-button"
        >
          <Shield className="size-6" strokeWidth={2.5} />
          {buttonLabel}
          <ArrowRight className="size-6" strokeWidth={2.5} />
        </Button>
      </motion.div>

      <div className="hub-hero-cinematic-meta">
        <Link href="/quick-drills" className="hub-hero-cinematic-alt">
          <Zap className="size-3.5" />
          Quick Drills
        </Link>
        {showFreeLabel && (
          <span className="hub-hero-cinematic-free">
            {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free daily — no sign-up
          </span>
        )}
      </div>

      {isSignedIn && isPremium && (
        <div className="mt-4">
          <PremiumAccessBanner compact />
        </div>
      )}
    </motion.div>
  );
}