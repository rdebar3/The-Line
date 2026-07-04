"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type HubFeaturedDocumentCardProps = {
  title: string;
  shortTitle: string;
  year: string;
  description: string;
  preview: string;
  href: string;
  icon: LucideIcon;
  accent: "gold" | "crimson" | "blue";
  index: number;
};

const accentConfig = {
  gold: {
    border: "border-gold/35 hover:border-gold/55",
    glow: "shadow-[0_12px_48px_rgba(201,162,39,0.18)] hover:shadow-[0_16px_56px_rgba(201,162,39,0.28)]",
    icon: "border-gold/40 bg-gold/15 text-gold",
    preview: "from-gold/[0.12] via-gold/[0.04] to-transparent",
    badge: "border-gold/30 bg-gold/10 text-gold",
    cta: "text-gold",
    line: "bg-gold/25",
  },
  crimson: {
    border: "border-crimson/35 hover:border-crimson/50",
    glow: "shadow-[0_12px_48px_rgba(185,28,28,0.15)] hover:shadow-[0_16px_56px_rgba(185,28,28,0.25)]",
    icon: "border-crimson/40 bg-crimson/15 text-crimson-light",
    preview: "from-crimson/[0.12] via-crimson/[0.04] to-transparent",
    badge: "border-crimson/30 bg-crimson/10 text-crimson-light",
    cta: "text-crimson-light",
    line: "bg-crimson/25",
  },
  blue: {
    border: "border-constitution-blue/35 hover:border-constitution-blue/50",
    glow: "shadow-[0_12px_48px_rgba(59,89,152,0.15)] hover:shadow-[0_16px_56px_rgba(59,89,152,0.25)]",
    icon: "border-constitution-blue/40 bg-constitution-blue/15 text-constitution-blue-light",
    preview: "from-constitution-blue/[0.14] via-constitution-blue/[0.04] to-transparent",
    badge: "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
    cta: "text-constitution-blue-light",
    line: "bg-constitution-blue/25",
  },
};

export function HubFeaturedDocumentCard({
  title,
  shortTitle,
  year,
  description,
  preview,
  href,
  icon: Icon,
  accent,
  index,
}: HubFeaturedDocumentCardProps) {
  const styles = accentConfig[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={href} className="group block h-full">
        <article
          className={cn(
            "premium-card flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl border bg-navy-elevated/70 transition-all duration-300 hover:-translate-y-2 sm:min-h-[24rem]",
            styles.border,
            styles.glow
          )}
        >
          <div
            className={cn(
              "relative border-b border-navy-border/50 bg-gradient-to-br px-5 py-6 sm:px-6 sm:py-7",
              styles.preview
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex size-16 shrink-0 items-center justify-center rounded-2xl border shadow-[0_0_32px_rgba(201,162,39,0.12)] transition-transform duration-300 group-hover:scale-105 sm:size-[4.5rem]",
                  styles.icon
                )}
              >
                <Icon className="size-8 sm:size-9" strokeWidth={1.5} />
              </span>
              <span
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-heading text-sm font-bold tracking-wider",
                  styles.badge
                )}
              >
                {year}
              </span>
            </div>

            <div className="mt-5 space-y-2 opacity-80" aria-hidden>
              <div className={cn("h-1.5 w-full rounded-full", styles.line)} />
              <div className={cn("h-1.5 w-[92%] rounded-full", styles.line)} />
              <div className={cn("h-1.5 w-[78%] rounded-full", styles.line)} />
              <div className={cn("h-1.5 w-[85%] rounded-full", styles.line)} />
            </div>

            <p className="mt-4 font-serif text-sm italic leading-relaxed text-foreground/75 sm:text-base">
              &ldquo;{preview}&rdquo;
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="font-heading text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {shortTitle}
              </p>
              <h3 className="mt-1.5 font-heading text-xl font-bold leading-snug tracking-wide text-foreground sm:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-navy-border/50 pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="size-3.5 text-gold/70" />
                Interactive reader
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-2.5",
                  styles.cta
                )}
              >
                Open
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}