"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Flame, Medal, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import type { WeeklyLeaderboardEntry } from "@/lib/weekly-leaderboard";
import { getWeeklyChallenge } from "@/lib/weekly-challenge";
import { cn } from "@/lib/utils";

export function WeeklyChallengeCard() {
  const { state } = useProgression();
  const challenge = getWeeklyChallenge();
  const [entries, setEntries] = useState<WeeklyLeaderboardEntry[]>([]);

  useEffect(() => {
    void fetch("/api/weekly-challenge")
      .then((res) => res.json())
      .then((data: { entries?: WeeklyLeaderboardEntry[] }) => {
        if (data.entries) setEntries(data.entries);
      })
      .catch(() => {
        /* optional board */
      });
  }, [state?.weeklyChallenge.bestScore]);

  if (!state) return null;

  const participated = state.weeklyChallenge.participated;
  const weekNumber = challenge.weekIndex;

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-crimson/35 bg-gradient-to-br from-crimson/15 via-crimson/5 to-navy/60 shadow-[0_0_50px_rgba(185,28,28,0.12)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-crimson/10 blur-3xl"
      />
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-transparent via-crimson/70 to-transparent"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-crimson/40 bg-crimson/15 shadow-[0_0_24px_rgba(185,28,28,0.2)]">
              <Calendar className="size-5 text-crimson" />
              <span className="mt-0.5 font-heading text-[0.6rem] font-bold tracking-wider text-crimson">
                W{weekNumber}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading text-[0.65rem] font-semibold tracking-[0.25em] text-crimson uppercase">
                  Weekly Challenge
                </p>
                {!participated && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-crimson/30 bg-crimson/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-crimson uppercase">
                    <Flame className="size-2.5" />
                    Live now
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-heading text-lg font-bold leading-snug text-balance text-foreground sm:text-xl">
                {challenge.title}
              </p>
              <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                {challenge.description}
              </p>
              {participated && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5">
                  <Trophy className="size-4 text-gold" />
                  <span className="text-sm font-medium text-foreground">
                    Your best:{" "}
                    <span className="font-bold text-gold">
                      {state.weeklyChallenge.bestScore} pts
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className={cn(
              "btn-crimson h-11 w-full shrink-0 rounded-xl px-6 text-sm font-semibold sm:w-auto",
              !participated && "shadow-[0_4px_30px_rgba(185,28,28,0.35)]"
            )}
          >
            {participated ? "Beat your score" : "Join the challenge"}
          </Button>
        </div>

        {entries.length > 0 && (
          <div className="mt-5 rounded-xl border border-navy-border/60 bg-navy/50 p-4">
            <p className="mb-3 flex items-center gap-2 font-heading text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
              <Medal className="size-3.5" />
              This week&apos;s leaders
            </p>
            <ol className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.userId}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                    entry.rank === 1
                      ? "border border-gold/25 bg-gold/10"
                      : "bg-navy-elevated/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-heading text-xs font-bold",
                        entry.rank === 1 ? "text-gold" : "text-muted-foreground"
                      )}
                    >
                      #{entry.rank}
                    </span>
                    <span className="font-medium text-foreground">
                      {entry.username}
                    </span>
                  </span>
                  <span className="font-semibold text-gold">{entry.score} pts</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}