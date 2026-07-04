"use client";

import { X } from "lucide-react";

import { LivingOathScene } from "@/components/living-oath/living-oath-scene";
import { Button } from "@/components/ui/button";
import type { LivingOathEvolution } from "@/lib/living-oath";

type LivingOathViewerProps = {
  open: boolean;
  onClose: () => void;
  evolution: LivingOathEvolution;
  defenderScore: number;
  savedLinesCount: number;
  certificationsEarned: number;
  dailyStreak: number;
};

export function LivingOathViewer({
  open,
  onClose,
  evolution,
  defenderScore,
  savedLinesCount,
  certificationsEarned,
  dailyStreak,
}: LivingOathViewerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#060a14]"
      role="dialog"
      aria-modal
      aria-labelledby="living-oath-viewer-title"
    >
      <div className="absolute inset-0">
        <LivingOathScene
          evolution={evolution}
          interactive
          autoRotate
          className="h-full w-full"
        />
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="pointer-events-auto flex items-center justify-between gap-3 border-b border-gold/15 bg-navy/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div>
            <p className="section-eyebrow !text-[0.65rem]">Your Living Oath</p>
            <h2
              id="living-oath-viewer-title"
              className="font-heading text-lg font-bold text-foreground sm:text-xl"
            >
              {evolution.tierLabel}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close viewer"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-auto pointer-events-auto border-t border-gold/15 bg-navy/85 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {evolution.tierDescription}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Stat label="Defender Score" value={defenderScore.toLocaleString()} />
            <Stat label="Saved Lines" value={String(savedLinesCount)} />
            <Stat label="Certifications" value={String(certificationsEarned)} />
            <Stat label="Daily Streak" value={String(dailyStreak)} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground/80">
            Drag to orbit · Scroll to zoom · Your beacon evolves as you train,
            save Lines, and earn credentials
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/20 bg-gold/[0.06] px-3 py-2.5 text-center">
      <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-heading text-lg font-bold text-gold">{value}</p>
    </div>
  );
}