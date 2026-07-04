"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { motion } from "motion/react";

import { useProgression } from "@/hooks/use-progression";
import { cn } from "@/lib/utils";

export function StartTrainingHubCard() {
  const { dailyMission, defenderScore, rank, isLoaded: progressionLoaded } =
    useProgression();

  const missionInProgress =
    dailyMission && !dailyMission.completed && dailyMission.progress > 0;

  if (!progressionLoaded || defenderScore === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Link
        href="/rights-under-pressure"
        className={cn(
          "group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-border/60",
          "bg-navy-elevated/45 px-5 py-4 transition-all hover:border-gold/30 hover:bg-navy-elevated/65 sm:px-6 sm:py-5"
        )}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 font-semibold text-gold">
            <Target className="size-3.5" />
            {defenderScore.toLocaleString()} pts
          </span>
          {rank && (
            <span className="text-muted-foreground">
              {rank.title}
            </span>
          )}
          {missionInProgress && (
            <span className="font-medium text-crimson-light">
              Mission {dailyMission.progress}/{dailyMission.target}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-transform group-hover:translate-x-0.5">
          {missionInProgress ? "Continue" : "Train"}
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </motion.div>
  );
}