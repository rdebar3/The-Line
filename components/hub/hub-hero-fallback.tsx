"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Radio, Shield, Zap } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export function HubHeroFallback() {
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
    <header className="hub-hero-fullscreen hub-hero-fallback">
      <div className="hub-hero-fallback-inner">
        <GuardianCharacter mood="neutral" size="hero" priority floating />
        <div className="hub-hero-3d-panel">
          <div className="hub-hero-3d-eyebrow">
            <Radio className="size-3 text-crimson-hover" />
            <span>Constitutional Command Center</span>
          </div>
          <h1 className="hub-hero-3d-title">
            <span className="hub-hero-3d-title-pre">The</span>
            <span className="hub-hero-3d-title-main">Line</span>
          </h1>
          <p className="hub-hero-3d-tagline">Know the standard. Hold the line.</p>
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="hub-hero-3d-button"
          >
            <Shield className="size-6" />
            {buttonLabel}
            <ArrowRight className="size-6" />
          </Button>
          <Link href="/quick-drills" className="hub-hero-3d-alt mt-4 inline-flex">
            <Zap className="size-3.5" />
            Quick Drills
          </Link>
          {showFreeLabel && (
            <p className="hub-hero-3d-free mt-3">
              {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free daily — no sign-up
            </p>
          )}
          {isSignedIn && isPremium && (
            <div className="mt-4">
              <PremiumAccessBanner compact />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}