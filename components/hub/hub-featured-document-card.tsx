"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";

import {
  FOUNDING_DOC_CARD_IMAGES,
  NATIONAL_ARCHIVES_CREDIT,
  type FoundingDocImageId,
} from "@/lib/founding-doc-images";
import { cn } from "@/lib/utils";

type HubFeaturedDocumentCardProps = {
  title: string;
  shortTitle: string;
  year: string;
  description: string;
  preview: string;
  href: string;
  imageId: FoundingDocImageId;
  accent: "gold" | "crimson" | "blue";
  index: number;
};

const accentConfig = {
  gold: {
    border: "border-gold/35 hover:border-gold/55",
    glow: "shadow-[0_12px_48px_rgba(201,162,39,0.18)] hover:shadow-[0_16px_56px_rgba(201,162,39,0.28)]",
    preview: "from-gold/[0.22] via-gold/[0.08] to-navy/75",
    badge: "border-gold/30 bg-gold/10 text-gold",
    cta: "text-gold",
    line: "bg-gold/35",
  },
  crimson: {
    border: "border-crimson/35 hover:border-crimson/50",
    glow: "shadow-[0_12px_48px_rgba(185,28,28,0.15)] hover:shadow-[0_16px_56px_rgba(185,28,28,0.25)]",
    preview: "from-crimson/[0.22] via-crimson/[0.08] to-navy/75",
    badge: "border-crimson/30 bg-crimson/10 text-crimson-light",
    cta: "text-crimson-light",
    line: "bg-crimson/35",
  },
  blue: {
    border: "border-constitution-blue/35 hover:border-constitution-blue/50",
    glow: "shadow-[0_12px_48px_rgba(59,89,152,0.15)] hover:shadow-[0_16px_56px_rgba(59,89,152,0.25)]",
    preview: "from-constitution-blue/[0.24] via-constitution-blue/[0.08] to-navy/75",
    badge: "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
    cta: "text-constitution-blue-light",
    line: "bg-constitution-blue/35",
  },
};

export function HubFeaturedDocumentCard({
  title,
  shortTitle,
  year,
  description,
  preview,
  href,
  imageId,
  accent,
  index,
}: HubFeaturedDocumentCardProps) {
  const styles = accentConfig[accent];
  const image = FOUNDING_DOC_CARD_IMAGES[imageId];

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
          <div className="relative overflow-hidden border-b border-navy-border/50">
            <div className="relative h-40 sm:h-44">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ objectPosition: image.objectPosition }}
                priority={index === 0}
              />
              <div
                aria-hidden
                className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  styles.preview
                )}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent"
              />

              <div className="relative z-10 flex items-start justify-end p-5 sm:px-6 sm:pt-5">
                <span
                  className={cn(
                    "rounded-lg border px-3 py-1.5 font-heading text-sm font-bold tracking-wider backdrop-blur-sm",
                    styles.badge
                  )}
                >
                  {year}
                </span>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 z-10 space-y-2 px-5 pb-4 sm:px-6"
                aria-hidden
              >
                <div className={cn("h-1.5 w-full rounded-full", styles.line)} />
                <div className={cn("h-1.5 w-[92%] rounded-full", styles.line)} />
                <div className={cn("h-1.5 w-[78%] rounded-full", styles.line)} />
                <div className={cn("h-1.5 w-[85%] rounded-full", styles.line)} />
              </div>
            </div>

            <div className="relative bg-navy/55 px-5 py-4 sm:px-6">
              <p className="font-serif text-sm italic leading-relaxed text-foreground/85 sm:text-base">
                &ldquo;{preview}&rdquo;
              </p>
              <p className="mt-2 text-[0.65rem] tracking-wide text-muted-foreground/80">
                {NATIONAL_ARCHIVES_CREDIT}
              </p>
            </div>
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