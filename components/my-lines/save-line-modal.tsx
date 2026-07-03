"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SAVED_LINE_NOTE_MAX, type SaveLineDraft } from "@/lib/saved-lines";

type SaveLineModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SaveLineDraft | null;
  existingNote?: string;
  onSave: (note: string) => Promise<void>;
};

export function SaveLineModal({
  open,
  onOpenChange,
  draft,
  existingNote = "",
  onSave,
}: SaveLineModalProps) {
  const [note, setNote] = useState(existingNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNote(existingNote);
      setError(null);
    }
  }, [open, existingNote]);

  if (!draft) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(note);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this Line.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="premium-card max-w-lg border-gold/20 bg-navy-elevated/95"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-foreground">
            Save to My Lines
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {draft.title}
            {draft.subtitle ? ` · ${draft.subtitle}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="rounded-xl border border-navy-border/70 bg-navy/50 px-4 py-3">
            <p className="max-h-40 overflow-y-auto font-serif text-sm leading-relaxed text-foreground/90">
              {draft.passageText}
            </p>
          </div>

          <div>
            <label
              htmlFor="line-note"
              className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Why does this matter to you?
            </label>
            <textarea
              id="line-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={SAVED_LINE_NOTE_MAX}
              rows={4}
              placeholder="Optional — your own words on why this passage belongs on the line you're holding."
              className="w-full resize-none rounded-lg border border-navy-border/80 bg-navy/60 px-3 py-2.5 text-sm text-foreground outline-none ring-gold/30 placeholder:text-muted-foreground/60 focus:border-gold/40 focus:ring-2"
            />
            <p className="mt-1 text-right text-[0.65rem] text-muted-foreground">
              {note.length}/{SAVED_LINE_NOTE_MAX}
            </p>
          </div>

          {error ? <p className="text-xs text-crimson">{error}</p> : null}

          <Button
            type="submit"
            disabled={saving}
            className="btn-gold min-h-11 w-full"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Line"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}