"use client";

import { Loader2, Medal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { DefenderBadgeShare } from "@/components/badges/defender-badge-share";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DefenderBadgeRecord } from "@/lib/defender-badges";

type DefenderBadgeUnlockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: DefenderBadgeRecord | null;
  loading?: boolean;
  error?: string | null;
};

export function DefenderBadgeUnlockModal({
  open,
  onOpenChange,
  badge,
  loading = false,
  error = null,
}: DefenderBadgeUnlockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-gold/40 bg-gradient-to-b from-navy-elevated to-navy sm:max-w-lg">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
                  <Medal className="size-6 text-gold" />
                </div>
                <DialogTitle className="font-heading text-2xl text-gold">
                  Defender Badge Earned
                </DialogTitle>
                <DialogDescription className="text-base text-foreground">
                  {badge?.milestoneLabel ?? "Forging your challenge coin…"}
                </DialogDescription>
              </DialogHeader>

              {loading && (
                <div className="mt-6 flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-8 animate-spin text-gold" />
                  <p>Generating your one-of-a-kind challenge coin…</p>
                  <p className="text-xs">This only happens once per achievement.</p>
                </div>
              )}

              {!loading && error && (
                <p className="mt-4 text-center text-sm text-crimson">{error}</p>
              )}

              {!loading && badge && (
                <DefenderBadgeShare badge={badge} className="mt-4" />
              )}

              {!loading && (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gold/25 text-gold"
                    onClick={() => onOpenChange(false)}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}