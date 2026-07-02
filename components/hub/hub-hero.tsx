"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, BookOpen, Shield } from "lucide-react";
import { motion } from "motion/react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { CHARACTER_NAME } from "@/lib/guardian";
import { FREE_DAILY_SCENARIO_GENERATION_LIMIT } from "@/lib/scenario-difficulty";

export function HubHero() {
  const { isSignedIn, isLoaded } = useAuth();
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

      {/* Primary path for new visitors — one obvious action above the fold */}
      <div className="mx-auto mt-6 max-w-md sm:mt-7">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="btn-cta premium-button h-14 w-full gap-2.5 rounded-2xl border border-gold/40 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark px-6 text-base font-bold tracking-wide text-white shadow-[0_8px_40px_rgba(185,28,28,0.45),0_0_24px_rgba(201,162,39,0.2)] hover:from-crimson-hover hover:via-crimson hover:to-gold sm:h-[3.75rem] sm:text-lg"
          >
            <Shield className="size-5 shrink-0" />
            Start Free Training ({FREE_DAILY_SCENARIO_GENERATION_LIMIT} Scenarios)
            <ArrowRight className="size-5 shrink-0" />
          </Button>
        </motion.div>
        <p className="mt-2.5 text-xs text-muted-foreground sm:text-sm">
          No account required to begin · {FREE_DAILY_SCENARIO_GENERATION_LIMIT}{" "}
          scenarios free every day
        </p>
      </div>

      <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
        Train on the founding text with {CHARACTER_NAME} — before the moment
        finds you unprepared.
      </p>

      <div className="relative mx-auto mt-6 max-w-md sm:mt-8 lg:mt-10">
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
            size="hero"
            priority
            floating
            showLabel
          />
        </div>
      </div>

      {/* Secondary actions — visible but not competing with the primary CTA */}
      <div className="mx-auto mt-5 flex max-w-sm flex-wrap items-center justify-center gap-2 sm:mt-6 sm:max-w-md sm:gap-2.5">
        <Button
          nativeButton={false}
          render={<Link href="#documents" />}
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-navy-border/80 bg-navy/30 px-3.5 text-xs font-medium text-muted-foreground hover:border-gold/30 hover:bg-navy-elevated/60 hover:text-foreground sm:text-sm"
        >
          <BookOpen className="size-3.5 shrink-0" />
          Founding Documents
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="#progression" />}
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-navy-border/80 bg-navy/30 px-3.5 text-xs font-medium text-muted-foreground hover:border-gold/30 hover:bg-navy-elevated/60 hover:text-foreground sm:text-sm"
        >
          Track Progress
        </Button>
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