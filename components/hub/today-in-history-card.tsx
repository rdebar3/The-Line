"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Calendar,
  ExternalLink,
  Flag,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { CHARACTER_NAME } from "@/lib/guardian";
import type { ThisDay250Entry, ThisDay250PublicResponse } from "@/lib/this-day-250";
import { HISTORY_YEARS_AGO } from "@/lib/this-day-250";
import { cn } from "@/lib/utils";

function renderSummaryWithLinks(summary: string) {
  const parts = summary.split(/(\[\[\d+\]\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/\[\[(\d+)\]\]\(([^)]+)\)/);
    if (!match) return <span key={index}>{part}</span>;
    return (
      <a
        key={index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:text-gold-light"
      >
        [{match[1]}]
      </a>
    );
  });
}

function TodayInHistoryShare({ entry }: { entry: ThisDay250Entry }) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const title = `This Day ${HISTORY_YEARS_AGO} Years Ago`;
    const text = `${title}\n${entry.eventTitle}\n\n${entry.summary.replace(/\[\[\d+\]\]\([^)]+\)/g, "")}\n\n${CHARACTER_NAME}: ${entry.commentary}\n\nSource: ${entry.citationUrl}`;
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
    link.download = `theline-history-${entry.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="mx-auto aspect-[9/16] max-w-[270px] overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-navy-elevated to-navy p-5 text-left shadow-xl"
      >
        <p className="font-heading text-[0.6rem] font-semibold tracking-[0.35em] text-gold uppercase">
          The Line · Today in History
        </p>
        <p className="mt-3 font-heading text-lg font-bold leading-tight text-foreground">
          This Day {HISTORY_YEARS_AGO} Years Ago
        </p>
        <p className="mt-1 text-xs font-medium text-crimson">
          {entry.historicalDateLabel}
        </p>
        <p className="mt-3 font-heading text-sm font-bold text-foreground">
          {entry.eventTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {entry.summary.replace(/\[\[\d+\]\]\([^)]+\)/g, "")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-gold">{CHARACTER_NAME}:</span>{" "}
          {entry.commentary}
        </p>
        <p className="mt-auto pt-4 text-[0.65rem] tracking-wide text-gold/80">
          {entry.citationLabel} · the-line-eight.vercel.app
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

export function TodayInHistoryCard() {
  const { isLoaded, logHubActivity } = useProgression();
  const [data, setData] = useState<ThisDay250PublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const activityLoggedRef = useRef(false);

  useEffect(() => {
    void fetch("/api/this-day-250")
      .then((res) => res.json())
      .then((payload: ThisDay250PublicResponse) => {
        setData(payload);
      })
      .catch(() => {
        setData({
          entry: null,
          america250Highlight: null,
          cached: false,
          message: "Unable to load today's history.",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoaded || !data?.entry || activityLoggedRef.current) return;
    activityLoggedRef.current = true;
    logHubActivity();
  }, [isLoaded, data?.entry, logHubActivity]);

  const entry = data?.entry;
  const highlight = data?.america250Highlight;

  return (
    <section
      id="today-in-history"
      aria-labelledby="today-in-history-heading"
      className="scroll-mt-24"
    >
      <div className="command-glass relative overflow-hidden rounded-3xl shadow-[0_0_60px_rgba(201,162,39,0.12),0_20px_80px_rgba(10,15,28,0.5)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 size-64 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.14)_0%,transparent_68%)]"
        />

        <div className="relative px-5 py-8 sm:px-10 sm:py-11">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/40 bg-gold/10 shadow-[0_0_24px_rgba(201,162,39,0.15)]">
                  <Calendar className="size-5 text-gold" />
                  <span className="mt-0.5 font-heading text-[0.55rem] font-bold tracking-wider text-gold">
                    250
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="section-eyebrow">Today in History</p>
                  <h2
                    id="today-in-history-heading"
                    className="mt-2 font-heading text-2xl font-bold leading-tight tracking-wide text-foreground sm:text-3xl"
                  >
                    This Day {HISTORY_YEARS_AGO} Years Ago
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    A daily moment from the Revolutionary era — sourced, cited,
                    and debriefed by {CHARACTER_NAME}. Free for every defender.
                  </p>
                </div>
              </div>

              {highlight && (
                <div className="mt-6 rounded-2xl border-2 border-crimson/35 bg-gradient-to-br from-crimson/15 via-crimson/5 to-navy/40 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/35 bg-crimson/15 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-crimson uppercase">
                      <Flag className="size-3" />
                      {highlight.label}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      America 250
                    </span>
                  </div>
                  <p className="mt-2 font-heading text-lg font-bold text-foreground">
                    {highlight.event.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {highlight.event.description}
                  </p>
                  {highlight.event.location && (
                    <p className="mt-2 text-xs font-medium text-gold/90">
                      {highlight.event.location}
                    </p>
                  )}
                  {highlight.event.url && (
                    <a
                      href={highlight.event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:text-crimson/80"
                    >
                      Learn more
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}

              {loading && (
                <div className="mt-6 rounded-2xl border border-gold/20 bg-navy/40 p-6">
                  <p className="text-sm text-muted-foreground">
                    Loading today&apos;s historical briefing…
                  </p>
                </div>
              )}

              {!loading && entry && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-gold/25 bg-navy/50 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-sm font-semibold tracking-wide text-gold">
                        {entry.historicalDateLabel}
                      </p>
                      {!entry.exactDateMatch && entry.dateRangeNote && (
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                          {entry.dateRangeNote}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-heading text-xl font-bold leading-snug text-foreground">
                      {entry.eventTitle}
                    </p>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {renderSummaryWithLinks(entry.summary)}
                    </p>
                    <a
                      href={entry.citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-light"
                    >
                      Source: {entry.citationLabel}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>

                  <div className="rounded-2xl border border-gold/20 bg-gold/[0.06] p-5 sm:p-6">
                    <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                      {CHARACTER_NAME}&apos;s Take
                    </p>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
                      {entry.commentary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowShare((value) => !value)}
                      className="btn-gold"
                    >
                      <Share2 className="size-4" />
                      {showShare ? "Hide share card" : "Share this moment"}
                    </Button>
                    <Link
                      href="/history"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-gold"
                    >
                      <Archive className="size-4" />
                      History archive
                    </Link>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="size-3.5 text-gold" />
                      Counts toward Defender Score
                    </span>
                  </div>

                  {showShare && (
                    <div className="pt-2">
                      <TodayInHistoryShare entry={entry} />
                    </div>
                  )}
                </div>
              )}

              {!loading && !entry && (
                <div
                  className={cn(
                    "mt-6 rounded-2xl border border-gold/20 bg-navy/40 p-6"
                  )}
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data?.message ??
                      "Today's briefing is being prepared. Check back soon."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}