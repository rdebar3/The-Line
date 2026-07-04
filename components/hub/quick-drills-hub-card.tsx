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
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Link
        href="/quick-drills"
        className="group flex h-full flex-col rounded-2xl border border-crimson/25 bg-gradient-to-br from-crimson/[0.08] via-navy-elevated/50 to-navy/60 p-5 transition-shadow hover:shadow-[0_8px_40px_rgba(185,28,28,0.15)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-crimson/35 bg-crimson/15">
            <Zap className="size-5 text-crimson-light" />
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
        <p className="mt-4 text-sm font-semibold text-crimson-light">
          {!isLoaded ? (
            "Loading…"
          ) : showLocked ? (
            "Unlock for full drill access"
          ) : activeMissions > 0 ? (
            <>
              {activeMissions} active mission{activeMissions === 1 ? "" : "s"}
            </>
          ) : (
            "Request a new drill"
          )}
        </p>
      </Link>
    </motion.div>
  );
}