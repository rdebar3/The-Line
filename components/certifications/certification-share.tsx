"use client";

import { useRef } from "react";
import { Share2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { CHARACTER_NAME, GUARDIAN_IMAGE } from "@/lib/guardian";
import {
  getCertificationDefinition,
  type CertificationRecord,
} from "@/lib/certifications";
import { cn } from "@/lib/utils";

type CertificationShareProps = {
  record: CertificationRecord;
  rankTitle: string;
  className?: string;
};

const ACCENT_STYLES = {
  gold: {
    border: "border-gold/50",
    glow: "shadow-[0_0_60px_rgba(201,162,39,0.25)]",
    ribbon: "from-gold/30 via-gold/10 to-transparent",
    seal: "text-gold",
    line: "bg-gold/40",
  },
  blue: {
    border: "border-constitution-blue/50",
    glow: "shadow-[0_0_60px_rgba(59,89,152,0.25)]",
    ribbon: "from-constitution-blue/30 via-constitution-blue/10 to-transparent",
    seal: "text-constitution-blue-light",
    line: "bg-constitution-blue/40",
  },
  crimson: {
    border: "border-crimson/50",
    glow: "shadow-[0_0_60px_rgba(185,28,28,0.25)]",
    ribbon: "from-crimson/30 via-crimson/10 to-transparent",
    seal: "text-crimson",
    line: "bg-crimson/40",
  },
} as const;

function formatEarnedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function CertificationShare({
  record,
  rankTitle,
  className,
}: CertificationShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const definition = getCertificationDefinition(record.id);
  const accent = ACCENT_STYLES[definition.accent];

  async function handleShare() {
    const text = `${definition.title}\nCertified by ${CHARACTER_NAME}\n${definition.document}\nAccuracy: ${record.accuracy}% · ${record.scenariosCompleted} scenarios · Rank: ${rankTitle}\n\nthe-line-eight.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: definition.title,
          text,
          url: window.location.origin,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
  }

  async function handleDownload() {
    const node = cardRef.current;
    if (!node) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `theline-${record.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={cardRef}
        className={cn(
          "relative mx-auto aspect-[3/4] max-w-[320px] overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-[#0f1628] via-[#0a0f1c] to-[#060a14] p-6 text-center",
          accent.border,
          accent.glow
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b",
            accent.ribbon
          )}
        />

        <p className="relative font-heading text-[0.55rem] font-semibold tracking-[0.4em] text-gold/90 uppercase">
          The Line · Civic Defense
        </p>

        <div className="relative mx-auto mt-4 size-16 overflow-hidden rounded-full border-2 border-gold/40 shadow-lg">
          <Image
            src={GUARDIAN_IMAGE}
            alt={CHARACTER_NAME}
            width={64}
            height={64}
            className="size-full object-cover"
          />
        </div>

        <p className="relative mt-3 font-heading text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
          Certificate of Achievement
        </p>

        <h3 className="relative mt-3 font-heading text-xl font-bold leading-tight text-foreground">
          {definition.title}
        </h3>

        <p className={cn("relative mt-1 text-xs font-semibold", accent.seal)}>
          {definition.sealLabel}
        </p>

        <div className={cn("relative mx-auto mt-4 h-px w-24", accent.line)} />

        <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
          Awarded for demonstrated mastery of
          <span className="block font-medium text-foreground">
            {definition.document}
          </span>
        </p>

        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-navy-border/50 bg-navy-elevated/50 px-2 py-2">
            <p className="font-heading text-lg font-bold text-gold">
              {record.accuracy}%
            </p>
            <p className="text-[0.6rem] tracking-wide text-muted-foreground uppercase">
              Accuracy
            </p>
          </div>
          <div className="rounded-lg border border-navy-border/50 bg-navy-elevated/50 px-2 py-2">
            <p className="font-heading text-lg font-bold text-gold">
              {record.scenariosCompleted}
            </p>
            <p className="text-[0.6rem] tracking-wide text-muted-foreground uppercase">
              Scenarios
            </p>
          </div>
          <div className="rounded-lg border border-navy-border/50 bg-navy-elevated/50 px-2 py-2">
            <p className="font-heading text-sm font-bold text-gold leading-tight">
              {rankTitle}
            </p>
            <p className="text-[0.6rem] tracking-wide text-muted-foreground uppercase">
              Rank
            </p>
          </div>
        </div>

        <p className="relative mt-5 text-[0.65rem] text-muted-foreground">
          Certified {formatEarnedDate(record.earnedAt)}
        </p>

        <p className="relative mt-4 font-heading text-[0.6rem] font-semibold tracking-[0.2em] text-gold/80 uppercase">
          {CHARACTER_NAME} · Training Officer
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleShare()}
          className="btn-gold"
        >
          <Share2 className="size-4" />
          Share certificate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleDownload()}
          className="border-gold/25 text-gold"
        >
          Download image
        </Button>
      </div>
    </div>
  );
}