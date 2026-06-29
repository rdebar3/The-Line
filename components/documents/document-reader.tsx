"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { accentStyles } from "@/components/documents/accent-styles";
import { DocumentHeader } from "@/components/documents/document-header";
import { PassagePanel } from "@/components/documents/passage-panel";
import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { FREE_PASSAGE_LIMIT, UNLOCK_FULL_LABEL } from "@/lib/subscription";
import type { FoundingDocument } from "@/lib/documents/types";
import { cn } from "@/lib/utils";

export function DocumentReader({ document }: { document: FoundingDocument }) {
  const { canAccess, openUnlockModal } = useSubscription();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const accent = accentStyles[document.accent];
  const hasUnlimitedPassages = canAccess("unlimited_passages");
  const selectedPassage =
    document.passages.find((passage) => passage.id === selectedId) ?? null;

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const index = document.passages.findIndex((passage) => passage.id === hash);
    if (index === -1) return;

    if (!hasUnlimitedPassages && index >= FREE_PASSAGE_LIMIT) {
      openUnlockModal();
      return;
    }

    setSelectedId(hash);
    requestAnimationFrame(() => {
      globalThis.document
        .getElementById(`passage-${hash}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [document.passages, hasUnlimitedPassages, openUnlockModal]);

  function handlePassageClick(passageId: string, index: number, isSelected: boolean) {
    if (!hasUnlimitedPassages && index >= FREE_PASSAGE_LIMIT) {
      openUnlockModal();
      return;
    }

    setSelectedId(isSelected ? null : passageId);
  }

  return (
    <div className="space-y-8">
      <DocumentHeader document={document} />

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">
            {document.passages.length}
          </span>{" "}
          passages
          {!hasUnlimitedPassages && (
            <span className="ml-2 text-gold">
              · {FREE_PASSAGE_LIMIT} free
            </span>
          )}
        </p>
        {selectedId && (
          <p>
            <span className="font-medium text-gold">1</span> selected
          </p>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-4">
          {document.passages.map((passage, index) => {
            const isSelected = selectedId === passage.id;
            const isLocked =
              !hasUnlimitedPassages && index >= FREE_PASSAGE_LIMIT;

            return (
              <button
                key={passage.id}
                id={`passage-${passage.id}`}
                type="button"
                onClick={() =>
                  handlePassageClick(passage.id, index, isSelected)
                }
                className={cn(
                  "group relative w-full min-h-[52px] rounded-2xl border px-5 py-5 text-left transition-all duration-300 active:scale-[0.99] sm:px-6 sm:py-6",
                  isLocked &&
                    "border-navy-border/50 bg-navy/30 hover:border-gold/25",
                  !isLocked &&
                    isSelected &&
                    accent.highlight,
                  !isLocked &&
                    !isSelected &&
                    "border-navy-border/80 bg-navy-elevated/50 hover:border-navy-border hover:bg-navy-elevated/80"
                )}
              >
                {isLocked && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-gold/25 bg-navy/80 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-gold uppercase">
                    <Lock className="size-2.5" />
                    Premium
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-heading text-xs font-semibold tracking-[0.2em] uppercase",
                        isLocked
                          ? "text-muted-foreground/60"
                          : isSelected
                            ? accent.text
                            : "text-muted-foreground"
                      )}
                    >
                      {passage.section}
                    </p>
                    <p
                      className={cn(
                        "mt-3 font-serif text-base leading-[1.85] tracking-[0.01em] sm:text-lg",
                        isLocked
                          ? "text-foreground/40"
                          : "text-foreground/90"
                      )}
                    >
                      {passage.text}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                    <span className="font-heading text-[0.65rem] tracking-widest text-muted-foreground/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {isLocked ? (
                      <Lock className="size-4 text-gold/60" />
                    ) : (
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform",
                          isSelected
                            ? "rotate-90 text-gold"
                            : "text-muted-foreground group-hover:translate-x-0.5"
                        )}
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="xl:sticky xl:top-[max(2rem,env(safe-area-inset-top))]">
          <PassagePanel
            passage={selectedPassage}
            accent={document.accent}
            className="hidden xl:block"
          />
        </div>
      </div>

      {selectedPassage && (
        <div className="xl:hidden">
          <PassagePanel passage={selectedPassage} accent={document.accent} />
        </div>
      )}

      {!hasUnlimitedPassages && document.passages.length > FREE_PASSAGE_LIMIT && (
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-navy/40 px-6 py-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <GuardianCharacter mood="thinking" size="sm" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {document.passages.length - FREE_PASSAGE_LIMIT} more passages locked
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Free includes {FREE_PASSAGE_LIMIT} passages per document. Unlock for
            every passage with {CHARACTER_NAME}&apos;s explanations, historical
            context, and modern relevance.
          </p>
          <Button onClick={openUnlockModal} className="btn-gold btn-cta mt-5">
            <Lock className="size-4" />
            {UNLOCK_FULL_LABEL}
          </Button>
        </div>
      )}
    </div>
  );
}