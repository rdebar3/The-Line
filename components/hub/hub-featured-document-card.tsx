"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
    border: "hover:border-[rgba(197,164,110,0.45)]",
    badge: "border-[rgba(197,164,110,0.3)] bg-[rgba(197,164,110,0.1)] text-[#C5A46E]",
    wash: "from-[rgba(197,164,110,0.28)] via-[rgba(197,164,110,0.08)] to-[#0A1628]",
    cta: "text-[#C5A46E]",
  },
  crimson: {
    border: "hover:border-[rgba(185,28,28,0.4)]",
    badge: "border-[rgba(185,28,28,0.3)] bg-[rgba(185,28,28,0.1)] text-[#e8a0a0]",
    wash: "from-[rgba(185,28,28,0.28)] via-[rgba(185,28,28,0.08)] to-[#0A1628]",
    cta: "text-[#e8a0a0]",
  },
  blue: {
    border: "hover:border-[rgba(107,140,206,0.4)]",
    badge:
      "border-[rgba(107,140,206,0.3)] bg-[rgba(59,89,152,0.12)] text-[#9bb3e0]",
    wash: "from-[rgba(59,89,152,0.3)] via-[rgba(59,89,152,0.08)] to-[#0A1628]",
    cta: "text-[#9bb3e0]",
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link href={href} className="group block h-full">
        <article
          className={cn(
            "museum-card min-h-[22rem] border-[rgba(197,164,110,0.14)] sm:min-h-[24rem]",
            styles.border
          )}
        >
          <div className="relative overflow-hidden border-b border-[rgba(197,164,110,0.1)]">
            <div className="relative h-40 sm:h-44">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ objectPosition: image.objectPosition }}
                priority={index === 0}
              />
              <div
                aria-hidden
                className={cn("absolute inset-0 bg-gradient-to-br", styles.wash)}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[rgba(10,22,40,0.35)] to-transparent"
              />

              <div className="relative z-10 flex items-start justify-end p-5 sm:px-6 sm:pt-5">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 font-heading text-sm font-medium tracking-wider backdrop-blur-sm",
                    styles.badge
                  )}
                >
                  {year}
                </span>
              </div>
            </div>

            <div className="relative bg-[rgba(10,22,40,0.55)] px-5 py-4 sm:px-6">
              <p className="museum-quote text-sm leading-relaxed sm:text-[0.95rem]">
                &ldquo;{preview}&rdquo;
              </p>
              <p className="mt-2 text-[0.65rem] tracking-wide text-[rgba(245,241,233,0.35)]">
                {NATIONAL_ARCHIVES_CREDIT}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-[rgba(245,241,233,0.4)] uppercase">
                {shortTitle}
              </p>
              <h3 className="mt-2 font-heading text-xl font-medium leading-snug tracking-tight text-[#F5F1E9] sm:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[rgba(245,241,233,0.55)]">
                {description}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[rgba(197,164,110,0.1)] pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgba(245,241,233,0.4)]">
                <BookOpen className="size-3.5 text-[rgba(197,164,110,0.7)]" />
                Interactive reader
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-2.5",
                  styles.cta
                )}
              >
                Open
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
