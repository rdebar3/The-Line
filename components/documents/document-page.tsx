import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { ArchiveDocumentReader } from "@/components/documents/archive-document-reader";
import type { DocumentAccent, FoundingDocument } from "@/lib/documents/types";
import { cn } from "@/lib/utils";

type DocumentPageProps = {
  document: FoundingDocument;
};

const ACCENT_STYLES: Record<
  DocumentAccent,
  {
    eyebrow: string;
    rule: string;
    glow: string;
  }
> = {
  gold: {
    eyebrow: "text-[#C5A46E]",
    rule: "via-[#C5A46E]",
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(197,164,110,0.12),transparent_65%)]",
  },
  blue: {
    eyebrow: "text-[#7BA3C9]",
    rule: "via-[#7BA3C9]",
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(123,163,201,0.12),transparent_65%)]",
  },
  crimson: {
    eyebrow: "text-[#C47A7A]",
    rule: "via-[#C47A7A]",
    glow: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,122,122,0.12),transparent_65%)]",
  },
};

/**
 * Full-bleed archive page shell for the three founding documents.
 *
 * Layout:
 *  - Premium breadcrumb + back control
 *  - Large serif page title (museum masthead)
 *  - ArchiveDocumentReader (parchment, TOC, context, save)
 *
 * No PageShell chrome — the archive owns the viewport under the site header.
 */
export function DocumentPage({ document }: DocumentPageProps) {
  const accent = ACCENT_STYLES[document.accent] ?? ACCENT_STYLES.gold;

  return (
    <div className="relative min-h-[calc(100dvh-var(--site-header-height,4rem))] bg-[#0A1628]">
      {/* ── Museum masthead ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-[rgba(197,164,110,0.12)]">
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", accent.glow)}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(197,164,110,0.28)] to-transparent"
        />

        <div className="relative mx-auto max-w-[90rem] px-4 pt-5 pb-10 sm:px-6 sm:pt-6 sm:pb-12 lg:px-8 lg:pb-14">
          {/* Breadcrumb + back */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1.5 text-[0.7rem] tracking-[0.04em] sm:text-[0.75rem]"
            >
              <Link
                href="/"
                className="shrink-0 text-[rgba(245,241,233,0.45)] transition-colors hover:text-[#C5A46E]"
              >
                Hub
              </Link>
              <ChevronRight
                className="size-3 shrink-0 text-[rgba(197,164,110,0.35)]"
                aria-hidden
              />
              <Link
                href="/#documents"
                className="shrink-0 text-[rgba(245,241,233,0.45)] transition-colors hover:text-[#C5A46E]"
              >
                Founding Documents
              </Link>
              <ChevronRight
                className="size-3 shrink-0 text-[rgba(197,164,110,0.35)]"
                aria-hidden
              />
              <span
                className="truncate font-medium text-[rgba(245,241,233,0.78)]"
                aria-current="page"
              >
                {document.title}
              </span>
            </nav>

            <Link
              href="/#documents"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(197,164,110,0.18)] bg-[rgba(197,164,110,0.05)] px-3.5 py-1.5 text-[0.7rem] font-medium tracking-[0.06em] text-[rgba(245,241,233,0.65)] uppercase transition-all duration-300 hover:border-[rgba(197,164,110,0.4)] hover:bg-[rgba(197,164,110,0.1)] hover:text-[#C5A46E]"
            >
              <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              All documents
            </Link>
          </div>

          {/* Large serif title */}
          <div className="mx-auto mt-9 max-w-3xl text-center sm:mt-11">
            <p
              className={cn(
                "text-[0.7rem] font-semibold tracking-[0.28em] uppercase",
                accent.eyebrow
              )}
            >
              {document.year} · Archive
            </p>
            <h1 className="mt-4 font-heading text-[2.15rem] font-medium leading-[1.12] tracking-[-0.02em] text-[#F5F1E9] sm:text-4xl md:text-[2.85rem] lg:text-[3.15rem]">
              {document.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed tracking-[0.01em] text-[rgba(245,241,233,0.52)] sm:text-base">
              {document.subtitle}
            </p>
            <div
              aria-hidden
              className={cn(
                "mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent to-transparent",
                accent.rule
              )}
            />
            <p className="mt-6 text-[0.7rem] tracking-[0.14em] text-[rgba(245,241,233,0.32)]">
              Tap any passage to study historical context and modern relevance
            </p>
          </div>
        </div>
      </header>

      {/* ── Immersive archive reader ────────────────────────────────── */}
      <ArchiveDocumentReader document={document} />
    </div>
  );
}

export default DocumentPage;
