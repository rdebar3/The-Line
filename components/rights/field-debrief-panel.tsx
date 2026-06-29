"use client";

import { ShieldCheck, ShieldX } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { GuardianReaction } from "@/components/rights/guardian-reaction";
import { CHARACTER_NAME } from "@/lib/guardian";
import { cn } from "@/lib/utils";

type FieldDebriefPanelProps = {
  hasAnswered: boolean;
  isCorrect?: boolean;
  feedbackMessage?: string;
  awaitingMessage: string;
};

export function FieldDebriefPanel({
  hasAnswered,
  isCorrect,
  feedbackMessage,
  awaitingMessage,
}: FieldDebriefPanelProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[max(2rem,env(safe-area-inset-top))] overflow-hidden rounded-2xl border border-navy-border/70 bg-navy-elevated/70 shadow-[0_12px_48px_rgba(10,15,28,0.5)]">
        <div
          aria-hidden
          className="h-1 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />

        <div className="px-7 py-8">
          <header className="border-b border-navy-border/50 pb-5 text-center">
            <p className="font-heading text-[0.65rem] font-semibold tracking-[0.4em] text-gold uppercase">
              Field Debrief
            </p>
            <p className="mt-2 font-heading text-xl font-semibold tracking-wide text-foreground">
              {CHARACTER_NAME}
            </p>
          </header>

          <div className="mt-7">
            {hasAnswered && feedbackMessage ? (
              <GuardianReaction
                variant="panel"
                mood={isCorrect ? "positive" : "negative"}
                message={feedbackMessage}
              />
            ) : (
              <AwaitingDebrief message={awaitingMessage} />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AwaitingDebrief({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6 w-full max-w-[200px]">
        <GuardianCharacter mood="thinking" size="md" floating />
        <div className="absolute right-0 bottom-1 flex size-10 items-center justify-center rounded-full border-2 border-constitution-blue/40 bg-constitution-blue/20 text-constitution-blue-light shadow-[0_4px_16px_rgba(59,89,152,0.25)] ring-2 ring-navy-elevated">
          <ShieldCheck className="size-5" strokeWidth={2} />
        </div>
      </div>

      <p className="font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase">
        Awaiting Your Call
      </p>

      <div className="mt-5 w-full rounded-xl border border-navy-border/60 bg-navy/35 px-5 py-5 text-left">
        <p className="font-serif text-[1.0625rem] leading-[1.85] tracking-[0.01em] text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}