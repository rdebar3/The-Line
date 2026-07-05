"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";

import { HubHeroBackground } from "@/components/hub/hub-hero-background";
import { HubHeroPatriot } from "@/components/hub/hub-hero-patriot";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const heroEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: heroEase },
  }),
};

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
  const buttonLabel = isGuest ? "Start Free Training" : ctaLabel;

  return (
    <header className="hub-hero-cinematic">
      <HubHeroBackground />

      <div className="hub-hero-layout">
        <div className="hub-hero-patriot-slot">
          <HubHeroPatriot />
        </div>

        <div className="hub-hero-content">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hub-hero-eyebrow"
          >
            <Radio className="size-3 text-crimson-light" />
            <span>Constitutional Command Center</span>
            <span className="hub-hero-eyebrow-divider" aria-hidden />
            <span className="text-gold/80">America 250</span>
          </motion.div>

          <motion.h1
            custom={0.08}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hub-hero-headline"
          >
            The Line
          </motion.h1>

          <motion.p
            custom={0.16}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hub-hero-subhead"
          >
            America&apos;s 250th year demands defenders who know the standard
            and hold the line.
          </motion.p>

          <motion.p
            custom={0.22}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hub-hero-body"
          >
            AI-powered civic defense — founding documents, live constitutional
            scenarios, and the training to protect what was written in blood and
            ink.
          </motion.p>

          <motion.div
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hub-hero-cta-shell"
          >
            <div className="hub-hero-cta-glass">
              <p className="hub-hero-cta-label">
                <Sparkles className="size-3.5 text-gold" />
                Primary Directive
              </p>

              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              >
                <Button
                  nativeButton={false}
                  render={<Link href="/rights-under-pressure" />}
                  className="hub-hero-cta-button"
                >
                  <span className="hub-hero-cta-button-glow" aria-hidden />
                  <Shield
                    className="relative z-10 size-7 shrink-0 sm:size-8"
                    strokeWidth={2.25}
                  />
                  <span className="relative z-10">{buttonLabel}</span>
                  <ArrowRight
                    className="relative z-10 size-7 shrink-0 sm:size-8"
                    strokeWidth={2.25}
                  />
                </Button>
              </motion.div>

              <Link
                href="/quick-drills"
                className="hub-hero-secondary-link"
              >
                <Zap className="size-3.5" />
                Or start with Quick Drills
              </Link>

              {showFreeLabel && (
                <p className="hub-hero-free-note">
                  {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free scenarios daily —
                  no sign-up required
                </p>
              )}
            </div>
          </motion.div>

          {isSignedIn && isPremium && (
            <motion.div
              custom={0.38}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-6 max-w-md lg:mx-0"
            >
              <PremiumAccessBanner compact />
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}