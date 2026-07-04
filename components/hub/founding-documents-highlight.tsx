import { FileText, Landmark, ScrollText } from "lucide-react";

import { DocumentCard } from "@/components/hub/document-card";

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
            <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
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