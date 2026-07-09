"use client";

import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import { motion } from "motion/react";

import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";

export function QuickDrillsHubCard() {
  const { grokMissions, isLoaded } = useProgression();
  const { canAccess, isLoading: subscriptionLoading } = useSubscription();

  const activeMissions = grokMissions.filter((m) => !m.completed).length;
  const canUseGrok = canAccess("grok_progression");
  const showLocked = !subscriptionLoading && !canUseGrok;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href="/quick-drills" className="hub-tactical-card group">
        <div className="flex items-start justify-between gap-3">
          <span className="relative flex size-11 items-center justify-center rounded-xl border border-crimson/35 bg-crimson/15">
            <Zap className="size-5 text-crimson-light" strokeWidth={1.75} />
            {isLoaded && !showLocked && activeMissions > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border border-crimson/40 bg-crimson text-[0.55rem] font-bold text-white">
                {activeMissions > 9 ? "9+" : activeMissions}
              </span>
            )}
          </span>
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
          Quick Drills
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          Short tactical missions from {CHARACTER_NAME} — general drills or
          focused remedial training on weak areas.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span
            aria-hidden
            className="h-1 flex-1 overflow-hidden rounded-full bg-navy-border/50"
          >
            <span
              className="block h-full rounded-full bg-crimson-light/80 transition-all"
              style={{
                width: !isLoaded || showLocked
                  ? "0%"
                  : activeMissions > 0
                    ? "66%"
                    : "12%",
              }}
            />
          </span>
          <p className="shrink-0 text-sm font-semibold text-crimson-light">
            {!isLoaded ? (
              "Loading…"
            ) : showLocked ? (
              "Unlock"
            ) : activeMissions > 0 ? (
              <>
                {activeMissions} active
              </>
            ) : (
              "New drill"
            )}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}