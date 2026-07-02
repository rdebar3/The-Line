"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useProgression } from "@/hooks/use-progression";

const PROMPT_KEY_PREFIX = "theline_callsign_prompted";

function getPromptKey(userId: string) {
  return `${PROMPT_KEY_PREFIX}:${userId}`;
}

function hasCompletedTraining(
  scenarioCount: number,
  adaptiveMissions: number,
  grokCompleted: number
) {
  return scenarioCount > 0 || adaptiveMissions > 0 || grokCompleted > 0;
}

export function CallsignPrompt() {
  const { isSignedIn, isLoaded: authLoaded, userId } = useAuth();
  const { defenderScore, isLoaded: progressionLoaded, state } = useProgression();
  const { data, saveUsername } = useLeaderboard(defenderScore, progressionLoaded);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const shouldOfferPrompt = useCallback(() => {
    if (!authLoaded || !progressionLoaded || !isSignedIn || !userId || !data?.me) {
      return false;
    }

    if (!data.me.isDefaultUsername) return false;
    if (typeof window !== "undefined" && localStorage.getItem(getPromptKey(userId))) {
      return false;
    }

    const scenarioCount = state?.scenarioHistory.length ?? 0;
    const adaptiveMissions = state?.adaptiveMissionHistory.missionsGenerated ?? 0;
    const grokCompleted =
      state?.grokMissions.filter((mission) => mission.completed).length ?? 0;

    const trained = hasCompletedTraining(
      scenarioCount,
      adaptiveMissions,
      grokCompleted
    );

    return trained || defenderScore >= 500;
  }, [
    authLoaded,
    data?.me,
    defenderScore,
    isSignedIn,
    progressionLoaded,
    state,
    userId,
  ]);

  useEffect(() => {
    if (shouldOfferPrompt()) {
      setOpen(true);
    }
  }, [shouldOfferPrompt]);

  function dismissPrompt() {
    if (userId && typeof window !== "undefined") {
      localStorage.setItem(getPromptKey(userId), "1");
    }
    setOpen(false);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await saveUsername(username);
      dismissPrompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save call sign.");
    } finally {
      setSaving(false);
    }
  }

  if (!isSignedIn) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismissPrompt();
        else setOpen(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton
        className="premium-card max-w-md border-gold/20 bg-navy-elevated/95"
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <Shield className="size-5 text-gold" />
          </div>
          <DialogTitle className="font-heading text-xl font-bold text-foreground">
            Welcome to the ranks!
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            You&apos;re on the Defender Leaderboard as{" "}
            <span className="font-semibold text-foreground">
              {data?.me?.displayName ?? data?.me?.username ?? "a new defender"}
            </span>
            . Claim your call sign so fellow citizen-defenders know who held the
            line.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSave(event)} className="space-y-4">
          <div>
            <label
              htmlFor="callsign-input"
              className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Choose your call sign
            </label>
            <input
              id="callsign-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. Patriot_1776"
              maxLength={20}
              className="min-h-11 w-full rounded-lg border border-navy-border/80 bg-navy/60 px-3 text-sm text-foreground outline-none ring-gold/30 placeholder:text-muted-foreground/60 focus:border-gold/40 focus:ring-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              3–20 characters · letters, numbers, hyphens, underscores
            </p>
          </div>

          {error ? <p className="text-xs text-crimson">{error}</p> : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={saving || username.trim().length < 3}
              className="btn-gold min-h-11 flex-1"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Choose Username"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={dismissPrompt}
              className="min-h-11 text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}