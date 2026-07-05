"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Zap } from "lucide-react";

import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export function HeroPanel() {
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
    <div className="hub-hero-v3-panel">
      <div className="hub-hero-v3-panel-glow" aria-hidden />
      <div className="hub-hero-v3-panel-border" aria-hidden />

      <div className="hub-hero-v3-eyebrow">
        <span className="hub-hero-v3-live" />
        <Radio className="size-3 text-crimson-hover" />
        <span>Constitutional Command Center</span>
        <span className="hub-hero-v3-sep" />
        <span className="text-gold/90">America 250</span>
      </div>

      <h1 className="hub-hero-v3-title">
        <span className="hub-hero-v3-title-pre">The</span>
        <span className="hub-hero-v3-title-main">Line</span>
      </h1>

      <p className="hub-hero-v3-tagline">Know the standard. Hold the line.</p>

      <p className="hub-hero-v3-copy">
        AI-powered civic defense — founding documents, live scenarios, and
        constitutional training for America&apos;s 250th year.
      </p>

      <div className="hub-hero-v3-button-wrap">
        <Button
          nativeButton={false}
          render={<Link href="/rights-under-pressure" />}
          className="hub-hero-v3-button"
        >
          <Shield className="relative z-[1] size-6" strokeWidth={2.5} />
          <span className="relative z-[1]">{buttonLabel}</span>
          <ArrowRight className="relative z-[1] size-6" strokeWidth={2.5} />
        </Button>
      </div>

      <div className="hub-hero-v3-meta">
        <Link href="/quick-drills" className="hub-hero-v3-alt">
          <Zap className="size-3.5" />
          Quick Drills
        </Link>
        {showFreeLabel && (
          <span className="hub-hero-v3-free">
            {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free daily — no sign-up
          </span>
        )}
      </div>

      {isSignedIn && isPremium && (
        <div className="mt-4">
          <PremiumAccessBanner compact />
        </div>
      )}
    </div>
  );
}