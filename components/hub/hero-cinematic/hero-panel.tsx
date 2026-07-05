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

const panelStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.35 },
  },
};

const panelItem = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease },
  },
};

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
      className="hub-hero-v3-panel"
      initial={reducedMotion ? false : { opacity: 0, y: 40, x: 32, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, x: 0, rotateY: 0 }}
      transition={{ duration: 0.95, ease }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              scale: 1.015,
              boxShadow:
                "0 0 60px rgba(201, 162, 39, 0.15), 0 24px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }
      }
    >
      <div className="hub-hero-v3-panel-glow" aria-hidden />
      <div className="hub-hero-v3-panel-border" aria-hidden />

      <motion.div
        variants={reducedMotion ? undefined : panelStagger}
        initial={reducedMotion ? false : "hidden"}
        animate="show"
      >
        <motion.div variants={reducedMotion ? undefined : panelItem} className="hub-hero-v3-eyebrow">
          <span className="hub-hero-v3-live" />
          <Radio className="size-3 text-crimson-hover" />
          <span>Constitutional Command Center</span>
          <span className="hub-hero-v3-sep" />
          <span className="text-gold/90">America 250</span>
        </motion.div>

        <motion.h1 variants={reducedMotion ? undefined : panelItem} className="hub-hero-v3-title">
          <span className="hub-hero-v3-title-pre">The</span>
          <span className="hub-hero-v3-title-main">Line</span>
        </motion.h1>

        <motion.p variants={reducedMotion ? undefined : panelItem} className="hub-hero-v3-tagline">
          Know the standard. Hold the line.
        </motion.p>

        <motion.p variants={reducedMotion ? undefined : panelItem} className="hub-hero-v3-copy">
          AI-powered civic defense — founding documents, live scenarios, and
          constitutional training for America&apos;s 250th year.
        </motion.p>

        <motion.div variants={reducedMotion ? undefined : panelItem}>
          <motion.div
            className="hub-hero-v3-button-wrap"
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          >
            <Button
              nativeButton={false}
              render={<Link href="/rights-under-pressure" />}
              className="hub-hero-v3-button"
            >
              <span className="hub-hero-v3-button-shine" aria-hidden />
              <Shield className="relative z-[1] size-6" strokeWidth={2.5} />
              <span className="relative z-[1]">{buttonLabel}</span>
              <ArrowRight className="relative z-[1] size-6" strokeWidth={2.5} />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={reducedMotion ? undefined : panelItem}
          className="hub-hero-v3-meta"
        >
          <Link href="/quick-drills" className="hub-hero-v3-alt">
            <Zap className="size-3.5" />
            Quick Drills
          </Link>
          {showFreeLabel && (
            <span className="hub-hero-v3-free">
              {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free daily — no sign-up
            </span>
          )}
        </motion.div>

        {isSignedIn && isPremium && (
          <motion.div variants={reducedMotion ? undefined : panelItem} className="mt-4">
            <PremiumAccessBanner compact />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}