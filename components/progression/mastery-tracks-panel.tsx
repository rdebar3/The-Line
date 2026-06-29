"use client";

import { Award, Target } from "lucide-react";

import { useProgression } from "@/hooks/use-progression";
import {
  BADGE_LABELS,
  getEarnedBadges,
  getMasteryTracks,
} from "@/lib/mastery-tracks";
import { getWeakAreas } from "@/lib/progression";
import { cn } from "@/lib/utils";

export function MasteryTracksPanel() {
  const { state } = useProgression();
  if (!state) return null;

  const tracks = getMasteryTracks(state);
  const badges = getEarnedBadges(state);
  const weakAreas = getWeakAreas(state.weakAreas).slice(0, 3);

  return (
    <section className="rounded-xl border border-navy-border/70 bg-navy/40 p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
          <Target className="size-5 text-gold" />
        </div>
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
            Amendment Mastery
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track accuracy across the founding corpus
          </p>
        </div>
      </div>

      {weakAreas.length > 0 && (
        <div className="mb-5 rounded-lg border border-crimson/20 bg-crimson/5 p-3.5 sm:p-4">
          <p className="mb-2.5 font-heading text-[0.65rem] font-semibold tracking-[0.18em] text-crimson/90 uppercase">
            Train this week
          </p>
          <ul className="space-y-2.5">
            {weakAreas.map((area) => {
              const pct = Math.round(area.accuracy * 100);
              const needsWork = pct < 80;
              return (
                <li key={area.amendment}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">
                      {area.amendment}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-heading font-bold",
                        needsWork ? "text-crimson" : "text-gold"
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-navy-border/50">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        needsWork ? "bg-crimson/70" : "bg-gold"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <p className="font-heading text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Corpus tracks
        </p>
        {tracks.map((track) => (
          <div
            key={track.id}
            className={cn(
              "rounded-lg border px-3.5 py-3 sm:px-4",
              track.mastered
                ? "border-gold/25 bg-gold/5"
                : "border-navy-border/60 bg-navy-elevated/30"
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
                {track.label}
              </span>
              <span
                className={cn(
                  "font-heading text-sm font-bold",
                  track.mastered ? "text-gold" : "text-muted-foreground"
                )}
              >
                {track.answered > 0 ? `${track.accuracy}%` : "—"}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-navy-border/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  track.mastered ? "bg-gold progress-bar-gold" : "bg-gold/55"
                )}
                style={{ width: `${track.answered > 0 ? track.accuracy : 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {track.answered === 0
                ? "Complete scenarios to start tracking"
                : track.mastered
                  ? "✓ Mastered — 80%+ over 5+ answers"
                  : `${track.answered} answered · 80%+ over 5 for mastery`}
            </p>
          </div>
        ))}
      </div>

      {badges.length > 0 && (
        <div className="mt-5 border-t border-navy-border/50 pt-4">
          <p className="mb-2.5 font-heading text-[0.65rem] font-semibold tracking-[0.18em] text-gold uppercase">
            Earned badges
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
              >
                <Award className="size-3.5" />
                {BADGE_LABELS[badge]}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}