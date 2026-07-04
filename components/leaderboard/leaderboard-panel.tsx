"use client";

import { SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Medal,
  Minus,
  RefreshCw,
  Trophy,
  UserRoundPen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLeaderboard, type LeaderboardRow } from "@/hooks/use-leaderboard";
import { useLeaderboardSyncState } from "@/components/leaderboard/leaderboard-sync-provider";
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

function CallsignCustomizer({
  currentName,
  onSave,
}: {
  currentName: string;
  onSave: (username: string) => Promise<string>;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(username);
      setOpen(false);
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save call sign.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-4 rounded-xl border border-navy-border/70 bg-navy/40 px-4 py-3 text-center text-sm text-muted-foreground">
        You&apos;re listed as{" "}
        <span className="font-semibold text-foreground">{currentName}</span>.{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-semibold text-gold underline-offset-2 hover:underline"
        >
          Claim your call sign
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mb-4 rounded-xl border border-gold/20 bg-gold/5 px-4 py-4"
    >
      <div className="flex items-center gap-2">
        <UserRoundPen className="size-4 text-gold" />
        <p className="font-heading text-sm font-semibold text-foreground">
          Claim your call sign
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        3–20 characters · letters, numbers, hyphens, underscores
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
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Cancel
      </button>
    </form>
  );
}

function ScoreboardRow({
  entry,
  highlightYou,
}: {
  entry: LeaderboardRow;
  highlightYou: boolean;
}) {
  const isYou = highlightYou && entry.isYou === true;

  return (
    <li
      className={cn(
        "grid grid-cols-[3rem_1fr_5.5rem] items-center gap-3 border-b border-navy-border/35 px-4 py-3.5 last:border-b-0 sm:grid-cols-[3.5rem_1fr_6.5rem] sm:px-5 sm:py-4",
        isYou &&
          "border-l-[3px] border-l-gold bg-gold/10 shadow-[inset_0_0_0_1px_rgba(201,162,39,0.2)]"
      )}
    >
      <span
        className={cn(
          "font-heading text-base font-bold tabular-nums sm:text-lg",
          isYou ? "text-gold" : "text-muted-foreground"
        )}
      >
        #{entry.rank}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-heading text-base font-semibold sm:text-lg",
            isYou ? "text-gold" : "text-foreground"
          )}
        >
          {entry.username}
        </span>
        {isYou ? (
          <span className="mt-0.5 inline-flex items-center rounded-full border border-gold/35 bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-gold uppercase">
            You
          </span>
        ) : null}
      </span>
      <span className="text-right font-heading text-base font-bold tabular-nums text-foreground sm:text-lg">
        {entry.score.toLocaleString()}
      </span>
    </li>
  );
}

type LeaderboardPanelProps = {
  /** Server-known flag — client fetch can lag or fail while storage is live. */
  configured?: boolean;
};

export function LeaderboardPanel({ configured = true }: LeaderboardPanelProps) {
  const { defenderScore, isLoaded, rank } = useProgression();
  const { data, isLoading, error, saveUsername, refresh } = useLeaderboard(
    defenderScore,
    isLoaded
  );
  const { rankDelta, dismissRankDelta } = useLeaderboardSyncState();

  const isLive = configured || data?.configured === true;
  const highlightYou = data?.isSignedIn === true;

  if (!isLive) {
    return (
      <section className="hub-card-shell text-center">
        <div aria-hidden className="hub-card-accent" />
        <div className="relative p-5 sm:p-6">
          <Trophy className="mx-auto size-5 text-gold/70" />
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">
            All-Time Patriots
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

      <div className="relative p-5 sm:p-8">
        <header className="hub-section-header">
          <p className="section-eyebrow">Defender Leaderboard</p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            All-Time Patriots
          </h2>
          <p className="hub-section-subtitle">
            Lifetime Defender Score — ranked by total points earned across all
            training.
          </p>
        </header>

        {rankDelta !== null && data?.me && (
          <RankMovementBanner
            delta={rankDelta}
            rank={data.me.rank}
            onDismiss={dismissRankDelta}
          />
        )}

        {data?.isSignedIn === false && (
          <div className="mb-4 rounded-xl border border-navy-border/70 bg-navy/40 px-4 py-3 text-center text-sm text-muted-foreground">
            <SignInButton mode="redirect">
              <button
                type="button"
                className="font-semibold text-gold underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </SignInButton>{" "}
            to join the all-time scoreboard and claim your call sign.
          </div>
        )}

        {data?.isSignedIn && data.me?.isDefaultUsername && data.me.displayName && (
          <CallsignCustomizer
            currentName={data.me.displayName}
            onSave={saveUsername}
          />
        )}

        {error && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-crimson">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              className="border-crimson/30 text-crimson hover:bg-crimson/10"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        )}

        {isLoading && !data ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : data ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-navy-border/70 bg-navy/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="grid grid-cols-[3rem_1fr_5.5rem] gap-3 border-b border-gold/20 bg-navy/60 px-4 py-3 text-[0.7rem] font-bold tracking-[0.18em] text-muted-foreground uppercase sm:grid-cols-[3.5rem_1fr_6.5rem] sm:px-5">
                <span>Rank</span>
                <span>Patriot</span>
                <span className="text-right">Total pts</span>
              </div>

              <div className="max-h-[min(28rem,60dvh)] overflow-y-auto overscroll-contain">
                <ol>
                  {data.entries.length === 0 ? (
                    <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                      {data.isSignedIn
                        ? "You're on the board — train to climb the ranks."
                        : "No defenders on the board yet. Sign in to join the ranks."}
                    </li>
                  ) : (
                    data.entries.map((entry) => (
                      <ScoreboardRow
                        key={`${entry.rank}-${entry.username}-${entry.score}`}
                        entry={entry}
                        highlightYou={highlightYou}
                      />
                    ))
                  )}
                </ol>

                {data.pinnedMe ? (
                  <div className="border-t border-gold/25 bg-navy/50">
                    <p className="px-5 pt-3 text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Your position
                    </p>
                    <ol>
                      <ScoreboardRow
                        entry={data.pinnedMe}
                        highlightYou={highlightYou}
                      />
                    </ol>
                  </div>
                ) : null}
              </div>
            </div>

            {data.me && data.isSignedIn && (
              <div className="mt-5 rounded-xl border border-gold/25 bg-gold/5 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
                      Your lifetime standing
                    </p>
                    <p className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
                      #{data.me.rank}{" "}
                      <span className="text-sm font-medium text-muted-foreground sm:text-base">
                        of {Math.max(data.me.totalPlayers, data.me.rank)} defenders
                      </span>
                    </p>
                    {data.me.isDefaultUsername && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Claim a custom call sign when you&apos;re ready.
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Lifetime score
                    </p>
                    <p className="mt-1 font-heading text-3xl font-bold text-foreground">
                      {data.me.score.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Medal className="size-3.5 text-gold" />
                  <span>
                    {rank.title} ({rank.abbreviation}) ·{" "}
                    {data.me.displayName ?? data.me.username ?? "Defender"}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}