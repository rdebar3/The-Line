"use client";

import { Medal } from "lucide-react";

import { DefenderBadgeShare } from "@/components/badges/defender-badge-share";
import { useDefenderBadges } from "@/components/badges/defender-badge-provider";

export function DefenderBadgesSection() {
  const { badges, isLoaded } = useDefenderBadges();

  if (!isLoaded) {
    return (
      <div className="animate-pulse rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading Defender badges…</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gold/25 bg-navy-elevated/30 px-6 py-10 text-center">
        <Medal className="mx-auto size-10 text-gold/50" />
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          No Defender badges yet
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Complete every passage in a founding document or earn a new Defender
          rank to forge a shareable challenge-coin badge.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="section-eyebrow">Defender Badges</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
          Your Challenge Coins
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {badges.length} earned · share your line-held milestones
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="rounded-2xl border border-gold/20 bg-navy/50 p-5 sm:p-6"
          >
            <p className="font-heading text-sm font-semibold text-gold">
              {badge.milestoneLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {badge.displayName} · {badge.rankTitle} ·{" "}
              {badge.defenderScore.toLocaleString()} pts ·{" "}
              {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <DefenderBadgeShare badge={badge} className="mt-4" />
          </div>
        ))}
      </div>
    </section>
  );
}