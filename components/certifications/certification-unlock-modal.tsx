"use client";

import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CertificationShare } from "@/components/certifications/certification-share";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCertificationDefinition,
  type CertificationId,
  type CertificationRecord,
} from "@/lib/certifications";

type CertificationUnlockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificationId: CertificationId | null;
  record: CertificationRecord | null;
  rankTitle: string;
  bonusPoints: number;
};

export function CertificationUnlockModal({
  open,
  onOpenChange,
  certificationId,
  record,
  rankTitle,
  bonusPoints,
}: CertificationUnlockModalProps) {
  if (!certificationId || !record) return null;

  const definition = getCertificationDefinition(certificationId);

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
                  <Sparkles className="size-6 text-gold" />
                </div>
                <DialogTitle className="font-heading text-2xl text-gold">
                  Certification Earned
                </DialogTitle>
                <DialogDescription className="text-base text-foreground">
                  {definition.title}
                </DialogDescription>
                {bonusPoints > 0 && (
                  <p className="text-sm font-semibold text-gold">
                    +{bonusPoints} Defender Score bonus awarded
                  </p>
                )}
              </DialogHeader>

              <CertificationShare
                record={record}
                rankTitle={rankTitle}
                className="mt-4"
              />

              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gold/25 text-gold"
                  onClick={() => onOpenChange(false)}
                >
                  Continue training
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}