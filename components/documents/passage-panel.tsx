import { BookOpen, Lightbulb, Scale } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { accentStyles } from "@/components/documents/accent-styles";
import type { DocumentAccent, DocumentPassage } from "@/lib/documents/types";
import { cn } from "@/lib/utils";

type PassagePanelProps = {
  passage: DocumentPassage | null;
  accent: DocumentAccent;
  className?: string;
};

export function PassagePanel({ passage, accent, className }: PassagePanelProps) {
  const styles = accentStyles[accent];

  if (!passage) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-navy-border/80 bg-navy-elevated/30 p-6 text-center sm:p-8",
          className
        )}
      >
        <GuardianCharacter mood="thinking" size="md" floating className="mx-auto" />
        <p className="mt-4 font-heading text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Select a Passage
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">
          Choose a paragraph from the document to see a clear explanation,
          historical context, and why it still matters today.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 rounded-2xl border bg-navy-elevated/70 p-5 duration-300 sm:p-8",
        styles.panelBorder,
        className
      )}
    >
      <p
        className={cn(
          "font-heading text-xs font-semibold tracking-[0.25em] uppercase",
          styles.text
        )}
      >
        {passage.section}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Lightbulb className="size-4 text-gold" />
            <h3 className="font-heading text-xs font-semibold tracking-[0.15em] uppercase">
              Explanation
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {passage.explanation}
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/60 bg-navy/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-gold">
            <BookOpen className="size-4" />
            <h3 className="font-heading text-xs font-semibold tracking-[0.15em] uppercase">
              Historical Context
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {passage.historicalContext}
          </p>
        </div>

        <div className="rounded-xl border border-navy-border/60 bg-navy/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-crimson">
            <Scale className="size-4" />
            <h3 className="font-heading text-xs font-semibold tracking-[0.15em] uppercase">
              Modern Relevance
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {passage.modernRelevance}
          </p>
        </div>
      </div>
    </div>
  );
}