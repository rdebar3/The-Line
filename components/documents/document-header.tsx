import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { accentStyles } from "@/components/documents/accent-styles";
import type { FoundingDocument } from "@/lib/documents/types";

export function DocumentHeader({ document }: { document: FoundingDocument }) {
  const accent = accentStyles[document.accent];

  return (
    <header className="relative animate-fade-up overflow-hidden rounded-3xl border border-navy-border/80 bg-navy-elevated/70 backdrop-blur-md">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${accent.glow}`}
      />
      <div className="relative grid gap-6 p-6 sm:gap-8 sm:p-10 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg border px-3 py-1 font-heading text-xs font-semibold tracking-[0.25em] uppercase ${accent.badge}`}
            >
              {document.year}
            </span>
            <span className="text-sm text-muted-foreground">
              Founding Document
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl md:text-5xl">
            {document.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {document.subtitle}
          </p>
          <p className="mt-4 text-sm text-muted-foreground/80">
            Tap any passage below to unlock {CHARACTER_NAME}&apos;s
            explanation.
          </p>
        </div>

        <div className="mx-auto shrink-0 lg:mx-0">
          <GuardianCharacter mood="thinking" size="lg" floating showLabel />
        </div>
      </div>
    </header>
  );
}