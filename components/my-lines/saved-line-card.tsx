"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2, Pencil, Share2, Trash2 } from "lucide-react";

import { SavedLineShare } from "@/components/my-lines/saved-line-share";
import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPassageUrl } from "@/lib/document-links";
import {
  excerptLine,
  SAVED_LINE_NOTE_MAX,
  type SavedLine,
} from "@/lib/saved-lines";
import { cn } from "@/lib/utils";

type SavedLineCardProps = {
  line: SavedLine;
  index: number;
};

export function SavedLineCard({ line, index }: SavedLineCardProps) {
  const { updateNote, removeLine } = useSavedLines();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [note, setNote] = useState(line.personalNote ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const href =
    line.documentSlug && line.passageId
      ? getPassageUrl(line.documentSlug, line.passageId)
      : line.source === "scenario"
        ? "/rights-under-pressure"
        : null;

  async function handleSaveNote() {
    setSaving(true);
    try {
      await updateNote(line.id, note);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeLine(line.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.24) }}
        className="premium-card flex h-full flex-col rounded-2xl border border-navy-border/70 bg-navy-elevated/50 p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              {line.source === "document" ? "Founding Text" : "Training Line"}
            </p>
            <h3 className="mt-1 font-heading text-lg font-bold text-foreground">
              {href ? (
                <Link href={href} className="hover:text-gold">
                  {line.title}
                </Link>
              ) : (
                line.title
              )}
            </h3>
            {line.subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{line.subtitle}</p>
            ) : null}
          </div>
        </div>

        <p className="flex-1 font-serif text-sm leading-relaxed text-foreground/85">
          {excerptLine(line.passageText, 180)}
        </p>

        {line.personalNote ? (
          <p className="mt-3 rounded-lg border border-gold/15 bg-gold/5 px-3 py-2 text-xs italic leading-relaxed text-foreground/80">
            &ldquo;{line.personalNote}&rdquo;
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground/70">
            No personal note yet.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-border/50 pt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setNote(line.personalNote ?? "");
              setEditing(true);
            }}
            className="border-navy-border/80"
          >
            <Pencil className="size-3.5" />
            Edit note
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSharing(true)}
            className="border-gold/25 text-gold"
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="text-crimson hover:bg-crimson/10 hover:text-crimson"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </Button>
        </div>
      </motion.article>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="premium-card max-w-md border-gold/20 bg-navy-elevated/95">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Edit your note
            </DialogTitle>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={SAVED_LINE_NOTE_MAX}
            rows={5}
            className="w-full resize-none rounded-lg border border-navy-border/80 bg-navy/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/30"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-gold"
              disabled={saving}
              onClick={() => void handleSaveNote()}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sharing} onOpenChange={setSharing}>
        <DialogContent className="premium-card max-w-sm border-gold/20 bg-navy-elevated/95">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Share your Line
            </DialogTitle>
          </DialogHeader>
          <SavedLineShare line={line} />
        </DialogContent>
      </Dialog>
    </>
  );
}