"use client";

import Link from "next/link";
import { ChevronRight, Landmark, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useSyncExternalStore } from "react";

import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import { getRepublicSimulatorAccess } from "@/lib/republic-simulator-access";
import { PATH_ROUTES, pathOverviewHref } from "@/lib/path-routes";
import { readRepublicSimulatorDemoUsed } from "@/lib/republic-simulator-demo";
import {
  FREE_REPUBLIC_SIMULATOR_LIMIT,
  PREMIUM_PRICE_LABEL,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

function subscribeDemoStore(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDemoSnapshot() {
  return readRepublicSimulatorDemoUsed();
}

export function RepublicSimulatorHubCard() {
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const { state, isLoaded: progressionLoaded } = useProgression();
  const demoUsed = useSyncExternalStore(
    subscribeDemoStore,
    getDemoSnapshot,
    () => false
  );

  const isLoading = subscriptionLoading || !progressionLoaded || !state;
  const access = state
    ? getRepublicSimulatorAccess(state, isPremium, demoUsed)
    : null;

  const href = !access
    ? PATH_ROUTES.simulator
    : access.reason === "capstone_incomplete"
      ? pathOverviewHref()
      : PATH_ROUTES.simulator;

  const showCapstoneLocked =
    !isLoading && access?.reason === "capstone_incomplete";
  const showPremiumLocked =
    !isLoading && access?.reason === "demo_exhausted";
  const showUnlocked = !isLoading && access?.canPlay;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link
        href={href}
        className={cn(
          "hub-tactical-card group relative overflow-hidden border-constitution-blue/30 shadow-[0_8px_40px_rgba(59,89,152,0.12)] hover:shadow-[0_12px_48px_rgba(59,89,152,0.2)]",
          showCapstoneLocked && "border-navy-border/70 opacity-95"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.15)_0%,transparent_68%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.1)_0%,transparent_68%)]"
        />

        <div className="relative flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-constitution-blue/40 bg-constitution-blue/20 shadow-[0_0_20px_rgba(59,89,152,0.2)]">
            <Landmark className="size-5 text-constitution-blue-light" />
          </span>
          <span className="rounded-full border border-gold/35 bg-gold/15 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] text-gold uppercase">
            Capstone
          </span>
        </div>

        <h3 className="relative mt-4 font-heading text-lg font-bold text-foreground sm:text-xl">
          Republic Simulator
        </h3>
        <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          The final challenge after all three path certifications. Step into the
          First Congress — Hamilton vs Madison, Grok counsel, and Defender Score
          on the line.
        </p>

        <p className="relative mt-4 text-sm font-semibold text-constitution-blue-light">
          {isLoading ? (
            "Loading…"
          ) : showCapstoneLocked ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Lock className="size-3.5" />
              Certify all 3 units to unlock
            </span>
          ) : showPremiumLocked ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Lock className="size-3.5" />
              Capstone cleared — unlock for {PREMIUM_PRICE_LABEL}
            </span>
          ) : isPremium ? (
            <span className="inline-flex items-center gap-1.5">
              Enter the capstone chamber
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              {FREE_REPUBLIC_SIMULATOR_LIMIT} free capstone demo
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </p>

        {showUnlocked && (
          <p className="relative mt-2 text-xs text-muted-foreground">
            Training path complete — chamber access granted.
          </p>
        )}
      </Link>
    </motion.div>
  );
}