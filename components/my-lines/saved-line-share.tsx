"use client";

import { useRef } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { excerptLine, type SavedLine } from "@/lib/saved-lines";
import { cn } from "@/lib/utils";

type SavedLineShareProps = {
  line: SavedLine;
  className?: string;
};

export function SavedLineShare({ line, className }: SavedLineShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const text = `${line.title}\n${line.subtitle ?? ""}\n\n${line.passageText}\n\n— My Lines · The Line`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: line.title,
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
    link.download = `my-line-${line.id.replace(/[^a-z0-9]+/gi, "-")}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={cardRef}
        className="relative mx-auto aspect-[9/16] max-w-[270px] overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-navy-elevated via-navy to-[#0a0f18] p-5 text-left shadow-xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.12)_0%,transparent_55%)]"
        />
        <p className="relative font-heading text-[0.6rem] font-semibold tracking-[0.35em] text-gold uppercase">
          My Lines · The Line
        </p>
        <p className="relative mt-3 font-heading text-lg font-bold leading-tight text-foreground">
          {line.title}
        </p>
        {line.subtitle ? (
          <p className="relative mt-1 text-xs font-medium text-crimson">
            {line.subtitle}
          </p>
        ) : null}
        <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
          {excerptLine(line.passageText, 220)}
        </p>
        {line.personalNote ? (
          <p className="relative mt-4 border-t border-gold/15 pt-3 text-xs italic leading-relaxed text-foreground/80">
            &ldquo;{excerptLine(line.personalNote, 120)}&rdquo;
          </p>
        ) : null}
        <div className="relative mt-auto flex items-end justify-between pt-6">
          <p className="text-[0.65rem] tracking-wide text-gold/80">
            {CHARACTER_NAME}
          </p>
          <GuardianCharacter mood="neutral" size="sm" showLabel={false} />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleShare()}
          className="btn-gold"
        >
          <Share2 className="size-4" />
          Share
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