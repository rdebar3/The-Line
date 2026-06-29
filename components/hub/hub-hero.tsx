"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, BookOpen, Shield } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import { CHARACTER_NAME } from "@/lib/guardian";

export function HubHero() {
  const { isSignedIn } = useAuth();

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
      <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        Train on the founding text with {CHARACTER_NAME} — before the moment
        finds you unprepared.
      </p>

      <div className="relative mx-auto mt-8 max-w-md sm:mt-10 lg:mt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.16)_0%,transparent_68%)] sm:h-72 sm:w-72"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[58%] h-px w-[min(100%,20rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        />
        <div className="relative flex justify-center px-4 py-2 sm:px-6 sm:py-4">
          <GuardianCharacter
            mood="neutral"
            size="hero"
            priority
            floating
            showLabel
          />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-col items-stretch gap-3 sm:mt-8 sm:max-w-lg sm:flex-row sm:justify-center">
        <Button
          nativeButton={false}
          render={<Link href="/rights-under-pressure" />}
          className="btn-crimson btn-cta premium-button h-12 w-full gap-2 rounded-xl sm:min-w-[11.5rem] sm:flex-none"
        >
          <Shield className="size-4 shrink-0" />
          Start Training
          <ArrowRight className="size-4 shrink-0" />
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="#documents" />}
          variant="outline"
          className="premium-button h-12 w-full rounded-xl border-gold/30 bg-navy/50 px-6 text-gold hover:border-gold/50 hover:bg-gold/10 sm:min-w-[11.5rem] sm:flex-none"
        >
          <BookOpen className="size-4 shrink-0" />
          Founding Documents
        </Button>
      </div>

      {!isSignedIn && (
        <>
          <p className="mx-auto mt-5 max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground sm:mt-6">
            Sign in to save your Defender Score and climb the leaderboard.
          </p>
          <div className="mx-auto mt-3 flex max-w-[16rem] flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-2.5">
            <Button
              nativeButton={false}
              render={<Link href="/sign-in" />}
              variant="outline"
              className="auth-btn-signin h-10 w-full rounded-xl border-navy-border/80 bg-navy-elevated/60 px-4 text-sm font-semibold tracking-wide text-foreground hover:border-gold/35 hover:bg-navy-elevated sm:w-auto sm:px-5"
            >
              Sign In
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/sign-up" />}
              className="auth-btn-signup btn-gold premium-button h-10 w-full rounded-xl px-4 text-sm font-semibold tracking-wide sm:w-auto sm:px-5"
            >
              Create Account
            </Button>
          </div>
        </>
      )}
    </header>
  );
}