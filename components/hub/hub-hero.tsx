"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Zap } from "lucide-react";
import { motion, useMotionValue } from "motion/react";
import { useCallback } from "react";

import { HubHeroBackground } from "@/components/hub/hub-hero-background";
import { HubHeroOrbit } from "@/components/hub/hub-hero-orbit";
import { HubHeroPatriot } from "@/components/hub/hub-hero-patriot";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const heroEase = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, delay, ease: heroEase },
  }),
};

export function HubHero() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium } = useSubscription();
  const { dailyMission } = useProgression();
  const isGuest = !isLoaded || !isSignedIn;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const ctaLabel = getTrainingCtaLabel({
    isPremium,
    dailyMission,
    isGuest,
  });

  const showFreeLabel = isGuest || !isPremium;
  const buttonLabel = isGuest ? "Start Free Training" : ctaLabel;

  return (
    <header
      className="hub-hero-oath"
      onMouseMove={handleMouseMove}
    >
      <HubHeroBackground mouseX={mouseX} mouseY={mouseY} />
      <HubHeroOrbit />

      <div className="hub-hero-monument">
        <div className="hub-hero-monument-copy">
          <motion.div
            custom={0.05}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="hub-hero-status"
          >
            <span className="hub-hero-status-dot" />
            <Radio className="size-3 text-crimson-light" />
            <span>Constitutional Command Center</span>
            <span className="hub-hero-status-sep" aria-hidden />
            <span className="text-gold/90">America 250</span>
            <span className="hub-hero-status-live">Live</span>
          </motion.div>

          <motion.div
            custom={0.15}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="hub-hero-title-block"
          >
            <span className="hub-hero-title-the">The</span>
            <h1 className="hub-hero-title-line">Line</h1>
          </motion.div>

          <motion.p
            custom={0.28}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="hub-hero-tagline"
          >
            Know the standard. Hold the line.
          </motion.p>

          <motion.p
            custom={0.36}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="hub-hero-deck"
          >
            America&apos;s semiquincentennial demands defenders who can read the
            text, face the pressure, and stand when liberty is tested.
          </motion.p>
        </div>

        <div className="hub-hero-patriot-slot">
          <HubHeroPatriot mouseX={mouseX} mouseY={mouseY} />
        </div>

        <motion.div
          custom={0.48}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="hub-hero-command-deck"
        >
          <div className="hub-hero-command-deck-corner hub-hero-command-deck-corner--tl" />
          <div className="hub-hero-command-deck-corner hub-hero-command-deck-corner--br" />

          <p className="hub-hero-command-label">Primary Directive</p>

          <motion.div
            className="hub-hero-ignite-wrap"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
          >
            <motion.span
              className="hub-hero-ignite-ring"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
            <motion.span
              className="hub-hero-ignite-ring hub-hero-ignite-ring--outer"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              aria-hidden
            />
            <Button
              nativeButton={false}
              render={<Link href="/rights-under-pressure" />}
              className="hub-hero-ignite-button"
            >
              <motion.span
                className="hub-hero-ignite-shine"
                animate={{ x: ["-140%", "240%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2,
                }}
                aria-hidden
              />
              <Shield className="relative z-10 size-7 sm:size-8" strokeWidth={2.5} />
              <span className="relative z-10">{buttonLabel}</span>
              <ArrowRight className="relative z-10 size-7 sm:size-8" strokeWidth={2.5} />
            </Button>
          </motion.div>

          <Link href="/quick-drills" className="hub-hero-alt-link">
            <Zap className="size-3.5" />
            Or start with Quick Drills
          </Link>

          {showFreeLabel && (
            <p className="hub-hero-free-note">
              {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free scenarios daily — no
              sign-up required
            </p>
          )}

          {isSignedIn && isPremium && (
            <div className="mt-5">
              <PremiumAccessBanner compact />
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}