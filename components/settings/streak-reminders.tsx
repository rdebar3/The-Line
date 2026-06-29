"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";

export function StreakReminders() {
  const { state, dailyMission, dailyStreak, setRemindersEnabled } =
    useProgression();

  if (!state) return null;

  const enabled = state.reminders.enabled;
  const missionLine = dailyMission
    ? `${dailyMission.progress}/${dailyMission.target} daily mission`
    : "daily mission";
  const showNudge =
    enabled &&
    dailyMission &&
    !dailyMission.completed &&
    dailyStreak > 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-navy-border/70 bg-navy/40 p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
          <Bell className="size-5 text-gold" />
        </div>
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
            Mission Nudges
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Stay on streak without spam
          </p>
        </div>
      </div>

      {showNudge && (
        <p className="mb-4 rounded-lg border border-gold/25 bg-gold/10 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
          Daily mission {dailyMission.progress}/{dailyMission.target} — hold
          your {dailyStreak}-day streak.
        </p>
      )}

      <p className="flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
        {enabled
          ? `Active · Streak ${dailyStreak}d · ${missionLine}. One reminder when you return.`
          : "Get a single nudge when you return if today's mission isn't finished."}
      </p>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setRemindersEnabled(!enabled)}
        className="mt-4 w-full border-gold/25 text-gold hover:bg-gold/10 sm:w-auto sm:self-start"
      >
        {enabled ? "Nudges on" : "Enable nudges"}
      </Button>
    </section>
  );
}