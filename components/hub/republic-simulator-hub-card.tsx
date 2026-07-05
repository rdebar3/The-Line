"use client";

import Link from "next/link";
import { ChevronRight, Landmark, Lock } from "lucide-react";
import { motion } from "motion/react";

import { useSubscription } from "@/hooks/use-subscription";
import {
  canAccessRepublicSimulator,
  FREE_REPUBLIC_SIMULATOR_LIMIT,
  PREMIUM_PRICE_LABEL,
} from "@/lib/subscription";
import { readRepublicSimulatorDemoUsed } from "@/lib/republic-simulator-demo";
import { useSyncExternalStore } from "react";

function subscribeDemoStore(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDemoSnapshot() {
  return readRepublicSimulatorDemoUsed();
}

export function RepublicSimulatorHubCard() {
  const { isPremium, isLoading } = useSubscription();
  const demoUsed = useSyncExternalStore(
    subscribeDemoStore,
    getDemoSnapshot,
    () => false
  );

  const hasAccess = isPremium || !demoUsed;
  const showLocked = !isLoading && !hasAccess;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link
        href="/republic-simulator"
        className="hub-tactical-card group relative overflow-hidden border-constitution-blue/30 shadow-[0_8px_40px_rgba(59,89,152,0.12)] hover:shadow-[0_12px_48px_rgba(59,89,152,0.2)]"
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
            Premium
          </span>
        </div>

        <h3 className="relative mt-4 font-heading text-lg font-bold text-foreground sm:text-xl">
          Republic Simulator
        </h3>
        <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          Step into the First Congress. Face Hamilton vs Madison on the National
          Bank — Grok counsel, real quotes, and Defender Score on the line.
        </p>

        <p className="relative mt-4 text-sm font-semibold text-constitution-blue-light">
          {isLoading ? (
            "Loading…"
          ) : showLocked ? (
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Unlock for full access — {PREMIUM_PRICE_LABEL}
            </span>
          ) : isPremium ? (
            <span className="inline-flex items-center gap-1.5">
              Enter the chamber
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              {FREE_REPUBLIC_SIMULATOR_LIMIT} free demo scenario
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </p>
      </Link>
    </motion.div>
  );
}