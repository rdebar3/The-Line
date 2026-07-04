"use client";

import Link from "next/link";
import { ArrowRight, Shield, Target } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getTrainingCtaLabel } from "@/lib/premium-status";
import { cn } from "@/lib/utils";

export function StartTrainingHubCard() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium } = useSubscription();
  const { dailyMission, defenderScore, rank, isLoaded: progressionLoaded } =
    useProgression();

  const showAuthCta = !isLoaded || !isSignedIn;
  const trainingLabel = getTrainingCtaLabel({
    isPremium,
    dailyMission,
    isGuest: showAuthCta,
  });

  const missionInProgress =
    dailyMission && !dailyMission.completed && dailyMission.progress > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-crimson/35",
          "bg-gradient-to-br from-crimson/[0.14] via-navy-elevated/70 to-navy/80",
          "shadow-[0_12px_60px_rgba(185,28,28,0.22),0_0_40px_rgba(201,162,39,0.08)]"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.12)_0%,transparent_68%)]"
        />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8 lg:p-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-crimson/40 bg-crimson/20 shadow-[0_0_24px_rgba(185,28,28,0.25)] sm:size-16">
                <Shield className="size-7 text-white sm:size-8" strokeWidth={1.75} />
              </span>
              <div>
                <p className="section-eyebrow !text-[0.65rem] sm:!text-xs">
                  Primary Mission
                </p>
                <h2 className="font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl lg:text-4xl">
                  Start Training
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Constitutional scenarios under pressure — build your Defender Score,
              earn rank, and prepare before the moment finds you.
            </p>

            {progressionLoaded && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 font-semibold text-gold">
                  <Target className="size-3.5" />
                  {defenderScore.toLocaleString()} pts
                </span>
                {rank && (
                  <span className="text-muted-foreground">
                    Rank:{" "}
                    <span className="font-semibold text-foreground">
                      {rank.title}
                    </span>
                  </span>
                )}
                {missionInProgress && (
                  <span className="text-crimson-light font-medium">
                    Daily mission {dailyMission.progress}/{dailyMission.target}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-full shrink-0 sm:w-auto sm:min-w-[17rem] lg:min-w-[19rem]">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              <Button
                nativeButton={false}
                render={<Link href="/rights-under-pressure" />}
                className="btn-cta premium-button h-14 w-full gap-2.5 rounded-2xl border border-gold/40 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark px-6 text-base font-bold tracking-wide text-white shadow-[0_8px_40px_rgba(185,28,28,0.45),0_0_24px_rgba(201,162,39,0.2)] hover:from-crimson-hover hover:via-crimson hover:to-gold sm:h-16 sm:text-lg"
              >
                {trainingLabel}
                <ArrowRight className="size-5 shrink-0" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}