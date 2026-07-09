"use client";

import { Shield, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { HubFeaturedDocumentCard } from "@/components/hub/hub-featured-document-card";
import { Button } from "@/components/ui/button";
import { EraTimeline } from "@/components/ui/visual-nav";
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
    imageId: "declaration" as const,
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
    imageId: "constitution" as const,
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
    imageId: "bill-of-rights" as const,
    accent: "crimson" as const,
  },
];

export function FoundingDocumentsHighlight() {
  const { isPremium, isLoading, openUnlockModal } = useSubscription();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="documents"
      aria-labelledby="founding-documents-heading"
      className="museum-section"
    >
      <div className="text-center">
        <p className="museum-eyebrow">Founding Documents</p>
        <h2
          id="founding-documents-heading"
          className="mx-auto mt-4 max-w-2xl font-heading text-2xl font-medium leading-tight tracking-tight text-[#F5F1E9] sm:text-3xl lg:text-[2.5rem]"
        >
          The charters of American liberty
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[rgba(245,241,233,0.55)] sm:text-base">
          Read the actual text that limits power — not summaries. Every document
          connects to your Defender Score, My Lines, and certifications.
        </p>

        <EraTimeline className="mx-auto mt-8 max-w-lg px-4" />

        {!isLoading && !isPremium && (
          <p className="mx-auto mt-5 max-w-md font-heading text-xl font-medium text-[#F5F1E9] sm:text-2xl">
            Full access · one-time{" "}
            <span className="text-[#C5A46E]">{PREMIUM_PRICE_LABEL}</span>
          </p>
        )}

        {!isLoading && isPremium && (
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.08)] px-5 py-2.5 text-sm font-medium text-[#C5A46E]">
            <Sparkles className="size-4 shrink-0" />
            Full access active — all documents unlocked
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-7">
        {documents.map((doc, index) => (
          <HubFeaturedDocumentCard key={doc.href} {...doc} index={index} />
        ))}
      </div>

      {!isLoading && !isPremium && (
        <div className="mx-auto mt-10 max-w-md sm:mt-12">
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            <Button
              type="button"
              onClick={openUnlockModal}
              className="museum-cta h-14 w-full gap-2.5 !rounded-full border-0 px-6 text-sm sm:h-14 sm:text-base"
            >
              <Shield className="size-4 shrink-0" />
              {UNLOCK_DOCUMENTS_TRAINING_CTA}
            </Button>
          </motion.div>
          <p className="mt-4 text-center text-xs leading-relaxed text-[rgba(245,241,233,0.4)]">
            {VALUE_PROPOSITION}
          </p>
          <p className="mt-2 text-center text-[0.7rem] tracking-wide text-[rgba(245,241,233,0.32)]">
            One-time payment · No subscription · Instant access
          </p>
        </div>
      )}
    </section>
  );
}
