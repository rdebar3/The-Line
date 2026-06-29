"use client";

import { SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Medal,
  Minus,
  Trophy,
  UserRoundPen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useProgression } from "@/hooks/use-progression";
import { cn } from "@/lib/utils";

function RankMovementBanner({
  delta,
  rank,
  onDismiss,
}: {
  delta: number;
  rank: number;
  onDismiss: () => void;
}) {
  const movedUp = delta > 0;
  const movedDown = delta < 0;

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        movedUp && "border-gold/35 bg-gold/10",
        movedDown && "border-crimson/35 bg-crimson/10",
        !movedUp && !movedDown && "border-navy-border/70 bg-navy/40"
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        {movedUp && <ArrowUp className="size-4 text-gold" />}
        {movedDown && <ArrowDown className="size-4 text-crimson" />}
        {!movedUp && !movedDown && <Minus className="size-4 text-muted-foreground" />}
        <span className="text-foreground">
          {movedUp && `Moved up ${delta} spot${delta === 1 ? "" : "s"} since your last visit`}
          {movedDown &&
            `Moved down ${Math.abs(delta)} spot${Math.abs(delta) === 1 ? "" : "s"} since your last visit`}
          {!movedUp && !movedDown && "Same rank as your last visit"}
          <span className="text-muted-foreground"> · You&apos;re #{rank}</span>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="self-end text-muted-foreground hover:text-foreground sm:self-auto"
      >
        Dismiss
      </Button>
    </div>
  );
}

function UsernameSetup({
  onSave,
}: {
  onSave: (username: string) => Promise<string>;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save username.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-4"
    >
      <div className="flex items-center gap-2">
        <UserRoundPen className="size-4 text-gold" />
        <p className="font-heading text-sm font-semibold text-foreground">
          Choose your leaderboard name
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        3–20 characters · letters, numbers, underscores
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="e.g. Patriot_1776"
          maxLength={20}
          className="min-h-10 flex-1 rounded-lg border border-navy-border/80 bg-navy/60 px-3 text-sm text-foreground outline-none ring-gold/30 placeholder:text-muted-foreground/60 focus:border-gold/40 focus:ring-2"
        />
        <Button
          type="submit"
          disabled={saving || username.trim().length < 3}
          className="btn-gold min-h-10 sm:min-w-[120px]"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-crimson">{error}</p>}
    </form>
  );
}

export function LeaderboardPanel() {
  const { defenderScore, isLoaded, rank } = useProgression();
  const {
    data,
    isLoading,
    error,
    rankDelta,
    dismissRankDelta,
    saveUsername,
  } = useLeaderboard(defenderScore, isLoaded);

  if (!data?.configured) {
    return (
      <section className="hub-card-shell text-center">
        <div aria-hidden className="hub-card-accent" />
        <div className="relative p-5 sm:p-6">
          <Trophy className="mx-auto size-5 text-gold/70" />
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">
            Defender Leaderboard
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Leaderboard storage is being set up. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="leaderboard" className="hub-card-shell scroll-mt-24">
      <div aria-hidden className="hub-card-accent" />

      <div className="relative p-5 sm:p-7">
      <header className="hub-section-header">
        <h2 className="section-eyebrow">Defender Leaderboard</h2>
        <p className="hub-section-subtitle">
          See where you stand among citizen-defenders on the line.
        </p>
      </header>

      {rankDelta !== null && data.me && (
        <RankMovementBanner
          delta={rankDelta}
          rank={data.me.rank}
          onDismiss={dismissRankDelta}
        />
      )}

      {data.isSignedIn === false && (
        <div className="mb-4 rounded-xl border border-navy-border/70 bg-navy/40 px-4 py-3 text-center text-sm text-muted-foreground">
          <SignInButton mode="redirect">
            <button
              type="button"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              Sign in
            </button>
          </SignInButton>{" "}
          to claim your rank and choose a leaderboard name.
        </div>
      )}

      {data.isSignedIn && !data.me?.username && (
        <div className="mb-4 space-y-2">
          <UsernameSetup onSave={saveUsername} />
          <p className="text-center text-xs text-muted-foreground">
            Pick a name to appear on the public top 10 — until then only your
            private standing below is shown.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : (
        <>
          <div className="-mx-1 overflow-x-auto sm:mx-0">
          <div className="min-w-[17.5rem] overflow-hidden rounded-xl border border-navy-border/70">
            <div className="grid grid-cols-[2.5rem_1fr_5rem] gap-2 border-b border-navy-border/60 bg-navy/50 px-4 py-2.5 text-[0.65rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:grid-cols-[3rem_1fr_6rem]">
              <span>Rank</span>
              <span>Defender</span>
              <span className="text-right">Score</span>
            </div>
            <ol>
              {data.top10.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {data.isSignedIn
                    ? "No public names on the board yet. Save a username to be the first."
                    : "No defenders on the board yet. Sign in and claim a name."}
                </li>
              ) : (
                data.top10.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.username}`}
                    className={cn(
                      "grid grid-cols-[2.5rem_1fr_5rem] gap-2 border-b border-navy-border/40 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[3rem_1fr_6rem]",
                      entry.isYou && "bg-gold/10"
                    )}
                  >
                    <span className="font-heading font-semibold text-gold">
                      #{entry.rank}
                    </span>
                    <span className="truncate font-medium text-foreground">
                      {entry.username}
                      {entry.isYou && (
                        <span className="ml-2 text-xs text-gold">(you)</span>
                      )}
                    </span>
                    <span className="text-right font-heading font-semibold text-foreground">
                      {entry.score.toLocaleString()}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </div>
          </div>

          {data.me && data.isSignedIn && (
            <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
                    Your Standing
                  </p>
                  <p className="mt-1 font-heading text-lg font-bold text-foreground">
                    #{data.me.rank}{" "}
                    <span className="text-sm font-medium text-muted-foreground">
                      of {Math.max(data.me.totalPlayers, data.me.rank)} synced
                      account{data.me.totalPlayers === 1 ? "" : "s"}
                    </span>
                  </p>
                  {!data.me.username && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Not listed publicly until you choose a username.
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Score
                  </p>
                  <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                    {data.me.score.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Medal className="size-3.5 text-gold" />
                <span>
                  {rank.title} ({rank.abbreviation}) ·{" "}
                  {data.me.username ?? "Set a username above"}
                </span>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </section>
  );
}