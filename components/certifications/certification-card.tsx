"use client";

import { Award, FileText, Landmark, Lock, ScrollText, Shield } from "lucide-react";
import { motion } from "motion/react";

import { CertificationProgressBar } from "@/components/certifications/certification-progress-bar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CertificationShare } from "@/components/certifications/certification-share";
import type { CertificationProgress } from "@/lib/certifications";
import { cn } from "@/lib/utils";

type CertificationCardProps = {
  progress: CertificationProgress;
  rankTitle: string;
  index?: number;
};

const ICONS = {
  "declaration-defender": ScrollText,
  "constitution-guardian": Landmark,
  "bill-of-rights-sentinel": FileText,
  "full-constitutional-defender": Shield,
} as const;

const ACCENT_CLASSES = {
  gold: {
    earned:
      "border-gold/60 bg-gradient-to-br from-gold/[0.14] via-navy-elevated/60 to-navy/70 shadow-[0_8px_40px_rgba(201,162,39,0.2)]",
    locked: "border-gold/20 bg-navy-elevated/40",
    icon: "border-gold/40 bg-gold/15 text-gold",
    badge: "bg-gold/20 text-gold",
  },
  blue: {
    earned:
      "border-constitution-blue/50 bg-gradient-to-br from-constitution-blue/[0.12] via-navy-elevated/60 to-navy/70 shadow-[0_8px_40px_rgba(59,89,152,0.18)]",
    locked: "border-constitution-blue/20 bg-navy-elevated/40",
    icon: "border-constitution-blue/40 bg-constitution-blue/15 text-constitution-blue-light",
    badge: "bg-constitution-blue/20 text-constitution-blue-light",
  },
  crimson: {
    earned:
      "border-crimson/50 bg-gradient-to-br from-crimson/[0.12] via-navy-elevated/60 to-navy/70 shadow-[0_8px_40px_rgba(185,28,28,0.18)]",
    locked: "border-crimson/20 bg-navy-elevated/40",
    icon: "border-crimson/40 bg-crimson/15 text-crimson",
    badge: "bg-crimson/20 text-crimson",
  },
} as const;

export function CertificationCard({
  progress,
  rankTitle,
  index = 0,
}: CertificationCardProps) {
  const { definition, earned, record, overallProgress, requirements } = progress;
  const Icon = ICONS[definition.id] ?? Award;
  const accent = ACCENT_CLASSES[definition.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={cn(
        "flex h-full flex-col rounded-2xl border p-5 transition-all sm:p-6",
        earned ? accent.earned : accent.locked
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border",
            accent.icon
          )}
        >
          {earned ? <Icon className="size-6" /> : <Lock className="size-5 opacity-70" />}
        </span>
        {earned ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.15em] uppercase",
              accent.badge
            )}
          >
            Earned
          </span>
        ) : (
          <span className="rounded-full border border-navy-border/60 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            {overallProgress}% ready
          </span>
        )}
      </div>

      <h3 className="mt-4 font-heading text-lg font-bold leading-tight text-foreground">
        {definition.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{definition.subtitle}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {definition.description}
      </p>

      {earned && record ? (
        <Dialog>
          <DialogTrigger
            className="mt-5 w-full rounded-xl border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            View & share certificate
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/25 bg-navy sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-gold">
                {definition.title}
              </DialogTitle>
            </DialogHeader>
            <CertificationShare record={record} rankTitle={rankTitle} />
          </DialogContent>
        </Dialog>
      ) : (
        <div className="mt-5 space-y-3">
          {definition.id === "full-constitutional-defender" &&
          requirements.prerequisites ? (
            <>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Required certificates
              </p>
              {requirements.prerequisites.map((prereq) => (
                <div
                  key={prereq.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{prereq.label}</span>
                  <span
                    className={cn(
                      "font-semibold",
                      prereq.met ? "text-gold" : "text-muted-foreground"
                    )}
                  >
                    {prereq.met ? "Earned" : "Locked"}
                  </span>
                </div>
              ))}
              <CertificationProgressBar
                label="Overall accuracy"
                current={requirements.accuracy.current}
                target={requirements.accuracy.target}
                progress={requirements.accuracy.progress}
                met={requirements.accuracy.met}
                suffix="%"
              />
            </>
          ) : (
            <CertificationProgressBar
              label="Scenarios completed"
              current={requirements.scenarios.current}
              target={requirements.scenarios.target}
              progress={requirements.scenarios.progress}
              met={requirements.scenarios.met}
            />
          )}

          {definition.id !== "full-constitutional-defender" && (
            <>
              <CertificationProgressBar
                label="Accuracy"
                current={requirements.accuracy.current}
                target={requirements.accuracy.target}
                progress={requirements.accuracy.progress}
                met={requirements.accuracy.met}
                suffix="%"
              />
            </>
          )}

          <CertificationProgressBar
            label="Defender Score"
            current={requirements.defenderScore.current}
            target={requirements.defenderScore.target}
            progress={requirements.defenderScore.progress}
            met={requirements.defenderScore.met}
          />

          <p className="pt-1 text-xs text-muted-foreground">
            Earn +{definition.bonusPoints} Defender Score when certified.
          </p>
        </div>
      )}
    </motion.div>
  );
}