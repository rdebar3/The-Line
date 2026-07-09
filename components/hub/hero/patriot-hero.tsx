"use client";

/**
 * PatriotHero — the hub command deck.
 *
 * A single, full-height cinematic hero that puts the No Face Patriot back on
 * screen: rim-lit figure on the left, command panel on the right with the
 * defender's live status (Score / Rank / Streak), the next mission, and one
 * primary CTA. Replaces LiveDrillHero (and supersedes the v3 / 3D / scroll-
 * scrub variants, which can now be deleted — see REDESIGN_NOTES.md).
 *
 * Motion: staggered entrance, pointer parallax on the background layers,
 * animated Defender Score count-up and mission progress fill. All of it is
 * disabled when the user prefers reduced motion.
 */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Map,
  Swords,
  Target,
} from "lucide-react";

import { useProgression } from "@/hooks/use-progression";
import { CHARACTER_NAME, GUARDIAN_IMAGE, guardianLabels } from "@/lib/guardian";
import {
  getContinueTrainingTarget,
  getLearningPathSummary,
  type PathStepId,
} from "@/lib/learning-path";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<PathStepId, typeof BookOpen> = {
  read: BookOpen,
  drill: Target,
  scenario: Swords,
  certify: Award,
};

const UNIT_ACCENT = {
  declaration: "text-gold",
  constitution: "text-constitution-blue-light",
  "bill-of-rights": "text-crimson",
} as const;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_OUT_LONG: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ENTRANCE: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const RISE: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/* ── Animated Defender Score ─────────────────────────────────────────── */

function ScoreValue({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(display, value, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <>{display.toLocaleString()}</>;
}

/* ── Background layers with pointer parallax ─────────────────────────── */

function HeroLayers({ parallax }: { parallax: boolean }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 40, damping: 16 });
  const springY = useSpring(pointerY, { stiffness: 40, damping: 16 });

  const flagX = useTransform(springX, [-0.5, 0.5], [8, -8]);
  const flagY = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const poolsX = useTransform(springX, [-0.5, 0.5], [16, -16]);
  const poolsY = useTransform(springY, [-0.5, 0.5], [10, -10]);

  useEffect(() => {
    if (!parallax) return;

    function onPointerMove(event: PointerEvent) {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [parallax, pointerX, pointerY]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="ph-void" />
      <motion.div
        className="ph-flag"
        style={parallax ? { x: flagX, y: flagY } : undefined}
      />
      <div className="ph-grid" />
      <motion.div
        className="ph-pools"
        style={parallax ? { x: poolsX, y: poolsY } : undefined}
      />
      <div className="ph-scan" />
      <div className="cine-grain" />
      <div className="cine-vignette" />
    </div>
  );
}

/* ── Patriot figure ──────────────────────────────────────────────────── */

function PatriotFigure() {
  return (
    <motion.div
      className="ph-patriot-wrap"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: EASE_OUT_LONG, delay: 0.15 }}
    >
      <div className="ph-patriot-aura ph-patriot-aura--crimson" aria-hidden />
      <div className="ph-patriot-aura ph-patriot-aura--gold" aria-hidden />
      <div className="ph-patriot-floor" aria-hidden />
      <div className="ph-patriot-breathe">
        <Image
          src={GUARDIAN_IMAGE}
          alt={guardianLabels.neutral}
          width={560}
          height={820}
          priority
          className="ph-patriot-img"
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 560px"
        />
      </div>
      <p className="ph-patriot-label">{CHARACTER_NAME}</p>
    </motion.div>
  );
}

/* ── Mission card ────────────────────────────────────────────────────── */

function MissionCard() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { state, isLoaded: progressionLoaded } = useProgression();
  const reduceMotion = useReducedMotion();
  const isGuest = !authLoaded || !isSignedIn;

  if (!progressionLoaded || !state) {
    return (
      <div className="ph-mission" aria-hidden>
        <div className="h-28 animate-pulse rounded-xl bg-navy/50" />
      </div>
    );
  }

  const target = getContinueTrainingTarget(state);
  const summary = getLearningPathSummary(state);
  const StepIcon = STEP_ICONS[target.step.id];
  const unitAccent = UNIT_ACCENT[target.unit.id];
  const progress = target.allUnitsComplete ? 100 : target.unit.overallProgress;

  return (
    <div className="ph-mission">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.24em] text-gold uppercase">
          {target.allUnitsComplete ? "Path complete" : "Next mission"}
        </p>
        <Link
          href="/path"
          className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-muted-foreground transition-colors hover:text-gold"
        >
          <Map className="size-3" />
          Full path
        </Link>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-navy/50">
          {target.allUnitsComplete ? (
            <CheckCircle2 className="size-5 text-gold" />
          ) : (
            <StepIcon className={cn("size-5", unitAccent)} />
          )}
        </span>
        <div className="min-w-0">
          {!target.allUnitsComplete && (
            <p className="font-mono text-[0.58rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Unit {target.unit.order} · {target.step.label}
            </p>
          )}
          <p className="mt-0.5 font-heading text-base font-bold leading-snug tracking-wide text-foreground">
            {target.headline}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {target.detail}
          </p>
        </div>
      </div>

      <div
        className="ph-progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          target.allUnitsComplete
            ? "Training path complete"
            : `Unit ${target.unit.order} progress`
        }
      >
        <motion.div
          className="ph-progress-fill"
          initial={{ width: reduceMotion ? `${progress}%` : "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.5 }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground/90">
        {summary.completedUnits} of {summary.totalUnits} units certified
      </p>

      <Link
        href={target.allUnitsComplete ? "/path" : target.href}
        className="ph-cta mt-4"
      >
        <span className="ph-cta-sheen" aria-hidden />
        {target.allUnitsComplete
          ? "View training path"
          : `Continue ${target.step.label.toLowerCase()}`}
        <ArrowRight className="size-5 shrink-0" />
      </Link>

      {isGuest && (
        <Link
          href="/sign-up"
          className="mt-3 block text-center text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          Create a free account to save your Defender Score and path progress.
        </Link>
      )}
    </div>
  );
}

/* ── Defender status strip ───────────────────────────────────────────── */

function DefenderStrip() {
  const { isLoaded, defenderScore, rank, dailyStreak } = useProgression();

  if (!isLoaded) {
    return (
      <div className="ph-status" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div key={index} className="ph-status-cell">
            <div className="mx-auto h-9 w-14 animate-pulse rounded bg-navy/50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className="ph-status">
      <div className="ph-status-cell ph-status-cell--gold">
        <dt className="ph-status-label">Defender Score</dt>
        <dd className="ph-status-value">
          <ScoreValue value={defenderScore} />
        </dd>
      </div>
      <div className="ph-status-cell">
        <dt className="ph-status-label">Rank</dt>
        <dd className="ph-status-value" title={rank.title}>
          {rank.abbreviation}
        </dd>
      </div>
      <div className="ph-status-cell">
        <dt className="ph-status-label">Streak</dt>
        <dd className="ph-status-value">
          {dailyStreak}
          <span className="text-sm font-medium text-muted-foreground">d</span>
        </dd>
      </div>
    </dl>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────── */

export function PatriotHero() {
  const reduceMotion = useReducedMotion();
  const [parallax, setParallax] = useState(false);

  // Pointer parallax only on devices with a fine pointer, never with
  // reduced motion.
  useEffect(() => {
    if (reduceMotion) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    setParallax(finePointer);
  }, [reduceMotion]);

  return (
    <header className="ph-root">
      <HeroLayers parallax={parallax} />

      <div className="ph-layout">
        <PatriotFigure />

        <motion.div
          className="cine-panel ph-panel"
          variants={reduceMotion ? undefined : ENTRANCE}
          initial={reduceMotion ? undefined : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
        >
          <span className="cine-panel-accent" aria-hidden />

          <motion.p variants={RISE} className="ph-eyebrow">
            <span className="ph-live-dot" aria-hidden />
            Civic Defense Training Ground
          </motion.p>

          <motion.h1 variants={RISE} className="ph-title">
            <span className="ph-title-pre">The</span>
            <span className="ph-title-main">Line</span>
          </motion.h1>

          <motion.p variants={RISE} className="ph-tagline">
            Know the standard. Hold the line.
          </motion.p>

          <motion.div variants={RISE}>
            <DefenderStrip />
          </motion.div>

          <motion.div variants={RISE}>
            <MissionCard />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
