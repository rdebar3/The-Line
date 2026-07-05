"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

import { HubHeroBackground } from "@/components/hub/hub-hero-background";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

const ease = [0.22, 1, 0.36, 1] as const;

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
    <header className="hub-hero-prime">
      <div className="hub-hero-prime-visual">
        <HubHeroBackground />
        <motion.div
          className="hub-hero-prime-portrait"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
        >
          <motion.div
            className="hub-hero-prime-portrait-glow"
            animate={{ opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Image
            src="/hero/patriot-portrait.jpg"
            alt={CHARACTER_NAME}
            fill
            priority
            sizes="(max-width: 1024px) 240px, 320px"
            className="hub-hero-prime-portrait-img"
          />
        </motion.div>
      </div>

      <motion.div
        className="hub-hero-prime-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, delay: 0.1, ease }}
      >
        <div className="hub-hero-prime-eyebrow">
          <span className="hub-hero-prime-live" />
          <Radio className="size-3 text-crimson-hover" />
          <span>Command Center</span>
          <span className="hub-hero-prime-sep" />
          <span className="text-gold/90">America 250</span>
        </div>

        <h1 className="hub-hero-prime-title">
          <span className="hub-hero-prime-title-pre">The</span>
          <span className="hub-hero-prime-title-main">Line</span>
        </h1>

        <p className="hub-hero-prime-tagline">
          Know the standard. Hold the line.
        </p>

        <p className="hub-hero-prime-copy">
          Founding documents, live scenarios, and constitutional training built
          for America&apos;s 250th year.
        </p>

        <motion.div
          className="hub-hero-prime-cta"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="hub-hero-prime-cta-pulse"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(201,162,39,0.45)",
                "0 0 0 10px rgba(201,162,39,0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
            aria-hidden
          />
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="hub-hero-prime-button"
          >
            <Shield className="size-5" strokeWidth={2.5} />
            {buttonLabel}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </Button>
        </motion.div>

        <div className="hub-hero-prime-meta">
          <Link href="/quick-drills" className="hub-hero-prime-alt">
            <Zap className="size-3.5" />
            Quick Drills
          </Link>
          {showFreeLabel && (
            <span className="hub-hero-prime-free">
              {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free daily — no sign-up
            </span>
          )}
        </div>

        {isSignedIn && isPremium && (
          <div className="mt-3">
            <PremiumAccessBanner compact />
          </div>
        )}
      </motion.div>
    </header>
  );
}