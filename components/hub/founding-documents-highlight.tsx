"use client";

import { FileText, Landmark, ScrollText, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { HubFeaturedDocumentCard } from "@/components/hub/hub-featured-document-card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import {
  PREMIUM_PRICE_LABEL,
  UNLOCK_DOCUMENTS_TRAINING_CTA,
  VALUE_PROPOSITION,
} from "@/lib/subscription";

const documents = [
  {
    title: "Declaration of Independence",
    shortTitle: "The Declaration",
    year: "1776",
    preview: "We hold these truths to be self-evident…",
    description:
      "Natural rights, self-government, and the moral case for liberty — every passage with tap-to-learn context.",
    href: "/declaration",
    icon: ScrollText,
    accent: "gold" as const,
  },
  {
    title: "The Constitution",
    shortTitle: "The Constitution",
    year: "1787",
    preview: "We the People of the United States…",
    description:
      "Limited government, separated powers, and ordered liberty — interactive notes and modern relevance.",
    href: "/constitution",
    icon: Landmark,
    accent: "blue" as const,
  },
  {
    title: "Bill of Rights",
    shortTitle: "Bill of Rights",
    year: "1791",
    preview: "Congress shall make no law…",
    description:
      "Ten amendments that limit federal power — study, save Lines, and train on real scenarios.",
    href: "/bill-of-rights",
    icon: FileText,
    accent: "crimson" as const,
  },
];

const valuePoints = [
  "Tap-to-learn on every passage",
  "Save highlights to My Lines",
  "Training scenarios from the text",
  "Notes, context & modern relevance",
];

export function FoundingDocumentsHighlight() {
  const { isPremium, isLoading, openUnlockModal } = useSubscription();

  return (
    <section
      id="documents"
      aria-labelledby="founding-documents-heading"
      className="scroll-mt-24"
    >
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] via-navy-elevated/80 to-navy/90 shadow-[0_0_60px_rgba(201,162,39,0.12),0_20px_80px_rgba(10,15,28,0.5)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 size-64 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.14)_0%,transparent_68%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 size-64 rounded-full bg-[radial-gradient(circle,rgba(185,28,28,0.08)_0%,transparent_68%)]"
        />

        <div className="relative px-5 py-8 sm:px-10 sm:py-11">
          <div className="text-center">
            <p className="section-eyebrow">Founding Documents</p>
            <h2
              id="founding-documents-heading"
              className="mx-auto mt-3 max-w-3xl font-heading text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl lg:text-[2.75rem]"
            >
              Full Interactive Access to America&apos;s Founding Documents
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold leading-relaxed text-gold sm:text-lg">
              Declaration • Constitution • Bill of Rights + Training Tools,
              Notes &amp; Scenarios
            </p>

            {!isLoading && !isPremium && (
              <div className="mx-auto mt-5 max-w-xl">
                <p className="font-heading text-2xl font-black tracking-wide text-foreground sm:text-3xl">
                  All for one-time{" "}
                  <span className="text-gold">{PREMIUM_PRICE_LABEL}</span>
                </p>
                <p className="mt-3 rounded-xl border border-gold/20 bg-gold/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {VALUE_PROPOSITION}
                </p>
              </div>
            )}

            {!isLoading && isPremium && (
              <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-gold">
                <Sparkles className="size-4 shrink-0" />
                Full access active — all documents unlocked
              </p>
            )}

            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Read the actual text that limits power — not summaries. Every
              document connects to your Defender Score, My Lines, and
              certifications.
            </p>
          </div>

          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-7 sm:gap-2.5">
            {valuePoints.map((point) => (
              <li
                key={point}
                className="rounded-full border border-gold/30 bg-gold/[0.1] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground/95 shadow-[0_0_16px_rgba(201,162,39,0.08)] sm:text-sm"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3 sm:gap-6">
            {documents.map((doc, index) => (
              <HubFeaturedDocumentCard key={doc.href} {...doc} index={index} />
            ))}
          </div>

          {!isLoading && !isPremium && (
            <div className="mx-auto mt-8 max-w-lg sm:mt-10">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <Button
                  type="button"
                  onClick={openUnlockModal}
                  className="btn-cta premium-button h-14 w-full gap-2.5 rounded-2xl border border-gold/45 bg-gradient-to-r from-gold via-gold-dark to-gold-dark px-6 text-base font-black tracking-wide text-navy shadow-[0_8px_40px_rgba(201,162,39,0.45),0_0_24px_rgba(201,162,39,0.2)] hover:from-gold-light hover:via-gold hover:to-gold sm:h-16 sm:text-lg"
                >
                  <Shield className="size-5 shrink-0" />
                  {UNLOCK_DOCUMENTS_TRAINING_CTA}
                </Button>
              </motion.div>
              <p className="mt-3 text-center text-xs font-medium tracking-wide text-muted-foreground">
                One-time payment · No subscription · Instant access
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}