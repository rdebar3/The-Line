"use client";

import { FileText, Landmark, ScrollText, Sparkles } from "lucide-react";

import { DocumentCard } from "@/components/hub/document-card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { PREMIUM_PRICE_LABEL } from "@/lib/subscription";

const documents = [
  {
    title: "Declaration of Independence",
    description:
      "Natural rights, self-government, and the moral case for liberty — with tap-to-learn context on every passage.",
    href: "/declaration",
    icon: ScrollText,
    accent: "gold" as const,
  },
  {
    title: "The Constitution",
    description:
      "Limited government, separated powers, and ordered liberty — interactive notes and modern relevance built in.",
    href: "/constitution",
    icon: Landmark,
    accent: "blue" as const,
  },
  {
    title: "Bill of Rights",
    description:
      "Ten amendments that limit federal power — study the text, save Lines, and train on real scenarios.",
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
      <div className="hub-card-shell overflow-hidden">
        <div aria-hidden className="hub-card-accent" />

        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="text-center">
            <p className="section-eyebrow">Founding Documents</p>
            <h2
              id="founding-documents-heading"
              className="mx-auto mt-3 max-w-3xl font-heading text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl lg:text-4xl"
            >
              Full Interactive Access to America&apos;s Founding Documents
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold leading-relaxed text-gold sm:text-lg">
              Declaration • Constitution • Bill of Rights + Training Tools,
              Notes &amp; Scenarios
            </p>

            {!isLoading && isPremium ? (
              <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
                <Sparkles className="size-4 shrink-0" />
                Full access active — all documents unlocked
              </p>
            ) : (
              <div className="mx-auto mt-5 max-w-lg">
                <p className="font-heading text-xl font-bold tracking-wide text-foreground sm:text-2xl">
                  All for one-time{" "}
                  <span className="text-gold">{PREMIUM_PRICE_LABEL}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every passage, full training depth, unlimited scenarios — no
                  subscription.
                </p>
                {!isLoading && (
                  <Button
                    type="button"
                    onClick={openUnlockModal}
                    className="btn-gold btn-cta mt-4 h-11 rounded-xl px-6 text-sm font-bold sm:text-base"
                  >
                    Unlock Full Access — {PREMIUM_PRICE_LABEL}
                  </Button>
                )}
              </div>
            )}

            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Read the actual text that limits power — not summaries. Every
              document is built for study, saving, and training that connects
              back to your Defender Score.
            </p>
          </div>

          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-2.5">
            {valuePoints.map((point) => (
              <li
                key={point}
                className="rounded-full border border-gold/25 bg-gold/[0.08] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground/90 sm:text-sm"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
            {documents.map((doc) => (
              <DocumentCard key={doc.href} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}