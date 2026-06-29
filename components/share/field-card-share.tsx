"use client";

import { useRef } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHARACTER_NAME } from "@/lib/guardian";
import { cn } from "@/lib/utils";

type FieldCardShareProps = {
  title: string;
  subtitle: string;
  body: string;
  footer?: string;
  className?: string;
};

export function FieldCardShare({
  title,
  subtitle,
  body,
  footer = "theline.app · Civic Defense",
  className,
}: FieldCardShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const text = `${title}\n${subtitle}\n\n${body}\n\n— ${footer}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.origin });
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
    link.download = "theline-field-card.png";
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={cardRef}
        className="mx-auto aspect-[9/16] max-w-[270px] overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-navy-elevated to-navy p-5 text-left shadow-xl"
      >
        <p className="font-heading text-[0.6rem] font-semibold tracking-[0.35em] text-gold uppercase">
          The Line
        </p>
        <p className="mt-3 font-heading text-lg font-bold leading-tight text-foreground">
          {title}
        </p>
        <p className="mt-1 text-xs font-medium text-crimson">{subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <p className="mt-auto pt-6 text-[0.65rem] tracking-wide text-gold/80">
          {CHARACTER_NAME} · {footer}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" onClick={() => void handleShare()} className="btn-gold">
          <Share2 className="size-4" />
          Share card
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