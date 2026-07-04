"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Flame, Maximize2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { LivingOathViewer } from "@/components/living-oath/living-oath-viewer";
import { Button } from "@/components/ui/button";
import { useLivingOath } from "@/hooks/use-living-oath";

const LivingOathScene = dynamic(
  () =>
    import("@/components/living-oath/living-oath-scene").then(
      (mod) => mod.LivingOathScene
    ),
  { ssr: false, loading: () => <BeaconPreviewFallback /> }
);

function BeaconPreviewFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#060a14]">
      <div className="size-16 animate-pulse rounded-full bg-gold/20" />
    </div>
  );
}

export function LivingOathHubCard() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const {
    evolution,
    isLoaded,
    defenderScore,
    savedLinesCount,
    certificationsEarned,
    dailyStreak,
  } = useLivingOath();

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-br from-gold/[0.1] via-navy-elevated/80 to-navy/90 shadow-[0_0_60px_rgba(201,162,39,0.15),0_20px_60px_rgba(10,15,28,0.45)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.18)_0%,transparent_68%)]"
        />

        <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/3] min-h-[14rem] overflow-hidden lg:aspect-auto lg:min-h-[18rem]">
            {isLoaded ? (
              <LivingOathScene
                evolution={evolution}
                autoRotate
                className="absolute inset-0"
              />
            ) : (
              <BeaconPreviewFallback />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-navy/40" />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-xl border border-gold/35 bg-gold/15">
                <Sparkles className="size-5 text-gold" />
              </span>
              <p className="section-eyebrow !text-[0.65rem]">AI-Powered</p>
            </div>

            <h2 className="mt-3 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
              Your Living Oath
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              A personal 3D No Face Patriot Beacon that evolves with your
              Defender Score, saved Lines, certifications, and streaks — stronger
              glow and honor marks as you progress.
            </p>

            {isLoaded && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                  {evolution.tierLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="size-3.5 text-crimson-light" />
                  {evolution.progressPercent}% oath strength
                </span>
              </div>
            )}

            <Button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="btn-cta premium-button mt-6 h-12 w-full gap-2 rounded-xl border border-gold/40 bg-gradient-to-r from-crimson/90 via-crimson-dark to-gold-dark text-sm font-bold text-white shadow-[0_8px_32px_rgba(201,162,39,0.25)] hover:from-crimson hover:to-gold sm:w-auto sm:px-8"
            >
              <Maximize2 className="size-4" />
              View Your Beacon
            </Button>
          </div>
        </div>
      </motion.article>

      <LivingOathViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        evolution={evolution}
        defenderScore={defenderScore}
        savedLinesCount={savedLinesCount}
        certificationsEarned={certificationsEarned}
        dailyStreak={dailyStreak}
      />
    </>
  );
}