"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export function HubHero() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium } = useSubscription();
  const { isTikTokBrowser } = useInAppBrowser();
  const showAuthCta = !isLoaded || !isSignedIn;

  return (
    <header className="animate-fade-up text-center">
      <div className="mx-auto mb-5 flex items-center justify-center gap-3 sm:mb-6 sm:gap-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/70 sm:w-20" />
        <span className="font-heading text-[0.6rem] font-semibold tracking-[0.45em] text-gold uppercase sm:text-xs sm:tracking-[0.5em]">
          Civic Defense
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/70 sm:w-20" />
      </div>

      <h1 className="hero-title-glow font-heading text-[2.25rem] font-bold leading-none tracking-[0.08em] text-foreground sm:text-6xl sm:tracking-[0.1em] lg:text-7xl">
        The Line
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-pretty text-lg font-semibold leading-snug tracking-wide text-foreground/95 sm:mt-5 sm:text-xl">
        When power pushes, the Constitution answers.
      </p>

      {isSignedIn && isPremium && (
        <div className="mx-auto mt-5 max-w-md sm:mt-6">
          <PremiumAccessBanner compact />
        </div>
      )}

      {showAuthCta && (
        <section
          aria-label="Welcome"
          className="mx-auto mt-5 max-w-md rounded-xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-transparent px-4 py-4 text-center sm:mt-6 sm:max-w-lg sm:px-5 sm:py-5"
        >
          <div
            aria-hidden
            className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          />
          <p className="font-heading text-sm font-semibold tracking-wide text-gold sm:text-base">
            Welcome to The Line.
          </p>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-foreground/85">
            Train on real constitutional scenarios with {CHARACTER_NAME}.
            Build your Defender Score, study the founding documents, and prepare
            to hold the line.
          </p>
          <p className="mt-2.5 text-xs font-medium tracking-wide text-gold/90 sm:text-sm">
            Start with {FREE_DAILY_SCENARIO_GENERATION_LIMIT} free scenarios — no
            sign-up required.
          </p>
        </section>
      )}

      {!showAuthCta && isLoaded && (
        <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
          Train on the founding text with {CHARACTER_NAME} — before the moment
          finds you unprepared.
        </p>
      )}

      <div className="relative mx-auto mt-5 max-w-sm sm:mt-6 lg:mt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.14)_0%,transparent_68%)] sm:h-64 sm:w-64"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[58%] h-px w-[min(100%,20rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
        />
        <div className="relative flex justify-center px-4 py-2 sm:px-6">
          <GuardianCharacter
            mood="neutral"
            size="lg"
            priority
            floating
            showLabel
          />
        </div>
      </div>

      {showAuthCta && (
        <div className="mx-auto mt-6 max-w-sm border-t border-navy-border/50 pt-5 sm:mt-7">
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground/90">
            {isTikTokBrowser
              ? "TikTok blocks Google sign-in. Use Open in Safari/Chrome from the banner, or continue with email."
              : "Optional: sign in to save your Defender Score and join the leaderboard."}
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-3 text-sm">
            <Link
              href="/sign-in"
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Sign in
            </Link>
            <span aria-hidden className="text-navy-border">
              ·
            </span>
            <Link
              href="/sign-up"
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}