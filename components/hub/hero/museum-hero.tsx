"use client";

/**
 * MuseumHero — quiet, full-viewport civic entrance.
 *
 * Large serif headline, subtle flag texture, single gold CTA.
 * Progression lives in the navbar score badge; this surface stays simple.
 */

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import { useProgression } from "@/hooks/use-progression";
import { getContinueTrainingTarget } from "@/lib/learning-path";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ENTRANCE: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const RISE: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

export function MuseumHero() {
  const reduceMotion = useReducedMotion();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { state, isLoaded: progressionLoaded } = useProgression();

  const target =
    progressionLoaded && state ? getContinueTrainingTarget(state) : null;
  const ctaHref = target?.allUnitsComplete
    ? "/path"
    : target?.href ?? "/path";
  const ctaLabel = !authLoaded
    ? "Begin"
    : !isSignedIn
      ? "Begin the Path"
      : target?.allUnitsComplete
        ? "View the Path"
        : "Continue Training";

  return (
    <header className="museum-hero">
      <div className="museum-hero-flag" aria-hidden />
      <div className="museum-hero-glow" aria-hidden />
      <div className="museum-hero-vignette" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:px-8 sm:py-28 md:py-32"
        variants={reduceMotion ? undefined : ENTRANCE}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <motion.p
          variants={reduceMotion ? undefined : RISE}
          className="museum-eyebrow"
        >
          Civic education · Founding documents
        </motion.p>

        <motion.h1
          variants={reduceMotion ? undefined : RISE}
          className="mt-7 max-w-3xl font-heading text-[2.35rem] font-medium leading-[1.12] tracking-[-0.01em] text-[#F5F1E9] sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-[4.25rem]"
        >
          Know the standard.
          <br />
          <span className="text-[#C5A46E]">Hold the line.</span>
        </motion.h1>

        <motion.p
          variants={reduceMotion ? undefined : RISE}
          className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-[rgba(245,241,233,0.68)] sm:text-lg"
        >
          Study the Declaration, the Constitution, and the Bill of Rights —
          then train to defend the principles they protect.
        </motion.p>

        <motion.div
          variants={reduceMotion ? undefined : RISE}
          className="mt-10 flex flex-col items-center gap-4 sm:mt-12"
        >
          <Link href={ctaHref} className="museum-cta group">
            {ctaLabel}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/#documents"
            className="text-sm font-medium tracking-wide text-[rgba(245,241,233,0.5)] transition-colors hover:text-[#C5A46E]"
          >
            Explore the founding documents
          </Link>
        </motion.div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#0A1628] to-transparent"
      />
    </header>
  );
}
