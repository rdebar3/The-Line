"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";

import { SaveLineModal } from "@/components/my-lines/save-line-modal";
import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import type { SaveLineDraft } from "@/lib/saved-lines";
import { cn } from "@/lib/utils";

type SaveLineButtonProps = {
  draft: SaveLineDraft;
  variant?: "default" | "compact";
  className?: string;
};

export function SaveLineButton({
  draft,
  variant = "default",
  className,
}: SaveLineButtonProps) {
  const { isSaved, getLine, saveLine } = useSavedLines();
  const [open, setOpen] = useState(false);
  const saved = isSaved(draft.id);
  const existing = getLine(draft.id);

  async function handleSave(note: string) {
    await saveLine(draft, note);
  }

  const isCompact = variant === "compact";

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        aria-label={saved ? "Edit saved Line" : "Save to My Lines"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-colors",
          saved
            ? "border-gold/40 bg-gold/15 text-gold hover:bg-gold/20"
            : "border-navy-border/80 bg-navy/50 text-foreground hover:border-gold/30 hover:text-gold",
          isCompact
            ? "h-9 px-3 text-xs"
            : "h-11 px-4 text-sm",
          className
        )}
      >
        <Bookmark className={cn("size-4", saved && "fill-current")} />
        <span>{saved ? "Saved to My Lines" : "Save to My Lines"}</span>
      </motion.button>

      <SaveLineModal
        open={open}
        onOpenChange={setOpen}
        draft={draft}
        existingNote={existing?.personalNote ?? ""}
        onSave={handleSave}
      />
    </>
  );
}