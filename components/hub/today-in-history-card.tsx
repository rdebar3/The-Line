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
        className="font-medium text-[#C5A46E] underline decoration-[rgba(197,164,110,0.4)] underline-offset-2 hover:text-[#D4B882]"
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
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="mx-auto aspect-[9/16] max-w-[270px] overflow-hidden rounded-2xl border border-[rgba(197,164,110,0.28)] bg-gradient-to-b from-[#0F1D33] to-[#0A1628] p-5 text-left shadow-xl"
      >
        <p className="font-heading text-[0.6rem] font-semibold tracking-[0.35em] text-[#C5A46E] uppercase">
          The Line · Today in History
        </p>
        <p className="mt-3 font-heading text-lg font-semibold leading-tight text-[#F5F1E9]">
          This Day {HISTORY_YEARS_AGO} Years Ago
        </p>
        <p className="mt-1 text-xs font-medium text-[rgba(197,164,110,0.85)]">
          {entry.historicalDateLabel}
        </p>
        <p className="mt-3 font-heading text-sm font-semibold text-[#F5F1E9]">
          {entry.eventTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[rgba(245,241,233,0.62)]">
          {entry.summary.replace(/\[\[\d+\]\]\([^)]+\)/g, "")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[rgba(245,241,233,0.88)]">
          <span className="font-semibold text-[#C5A46E]">{CHARACTER_NAME}:</span>{" "}
          {entry.commentary}
        </p>
        <p className="mt-auto pt-4 text-[0.65rem] tracking-wide text-[rgba(197,164,110,0.75)]">
          {entry.citationLabel} · the-line-eight.vercel.app
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleShare()}
          className="museum-cta !min-h-9 !rounded-full !px-4 !text-xs"
        >
          <Share2 className="size-3.5" />
          Share card
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleDownload()}
          className="rounded-full border-[rgba(197,164,110,0.28)] text-[#C5A46E] hover:bg-[rgba(197,164,110,0.08)]"
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
      className="museum-section"
    >
      <div className="museum-panel">
        <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-5">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.08)]">
                  <Calendar className="size-5 text-[#C5A46E]" />
                  <span className="mt-0.5 font-heading text-[0.55rem] font-semibold tracking-wider text-[#C5A46E]">
                    250
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="museum-eyebrow">Today in History</p>
                  <h2
                    id="today-in-history-heading"
                    className="mt-3 font-heading text-2xl font-medium leading-tight tracking-tight text-[#F5F1E9] sm:text-3xl lg:text-[2.15rem]"
                  >
                    This Day {HISTORY_YEARS_AGO} Years Ago
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[rgba(245,241,233,0.58)] sm:text-base">
                    A daily moment from the Revolutionary era — sourced, cited,
                    and debriefed by {CHARACTER_NAME}. Free for every defender.
                  </p>
                </div>
              </div>

              {highlight && (
                <div className="mt-8 rounded-2xl border border-[rgba(197,164,110,0.2)] bg-[rgba(197,164,110,0.05)] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.1)] px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-[#C5A46E] uppercase">
                      <Flag className="size-3" />
                      {highlight.label}
                    </span>
                    <span className="text-xs font-medium text-[rgba(245,241,233,0.45)]">
                      America 250
                    </span>
                  </div>
                  <p className="mt-3 font-heading text-lg font-medium text-[#F5F1E9]">
                    {highlight.event.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(245,241,233,0.58)]">
                    {highlight.event.description}
                  </p>
                  {highlight.event.location && (
                    <p className="mt-2 text-xs font-medium text-[rgba(197,164,110,0.85)]">
                      {highlight.event.location}
                    </p>
                  )}
                  {highlight.event.url && (
                    <a
                      href={highlight.event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#C5A46E] transition-colors hover:text-[#D4B882]"
                    >
                      Learn more
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}

              {loading && (
                <div className="mt-8 space-y-3 rounded-2xl border border-[rgba(197,164,110,0.12)] bg-[rgba(10,22,40,0.45)] p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-[rgba(197,164,110,0.12)]" />
                  <div className="h-6 w-2/3 animate-pulse rounded bg-[rgba(197,164,110,0.1)]" />
                  <div className="h-16 w-full animate-pulse rounded bg-[rgba(197,164,110,0.08)]" />
                </div>
              )}

              {!loading && entry && data?.message && (
                <p className="mt-8 text-sm leading-relaxed text-[rgba(245,241,233,0.55)]">
                  {data.message}
                </p>
              )}

              {!loading && entry && (
                <div className="mt-8 space-y-5">
                  <div className="rounded-2xl border border-[rgba(197,164,110,0.14)] bg-[rgba(10,22,40,0.5)] p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-sm font-medium tracking-wide text-[#C5A46E]">
                        {entry.historicalDateLabel}
                      </p>
                      {!entry.exactDateMatch && entry.dateRangeNote && (
                        <span className="rounded-full border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)] px-2 py-0.5 text-[0.65rem] font-medium text-[#C5A46E]">
                          {entry.dateRangeNote}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-heading text-xl font-medium leading-snug text-[#F5F1E9] sm:text-2xl">
                      {entry.eventTitle}
                    </p>
                    <p className="mt-4 text-pretty text-sm leading-relaxed text-[rgba(245,241,233,0.62)] sm:text-base">
                      {renderSummaryWithLinks(entry.summary)}
                    </p>
                    <a
                      href={entry.citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#C5A46E] transition-colors hover:text-[#D4B882]"
                    >
                      Source: {entry.citationLabel}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>

                  <div className="rounded-2xl border border-[rgba(197,164,110,0.12)] bg-[rgba(197,164,110,0.05)] p-6 sm:p-7">
                    <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-[#C5A46E] uppercase">
                      {CHARACTER_NAME}&apos;s Take
                    </p>
                    <p className="museum-quote mt-3 text-pretty text-base leading-relaxed sm:text-lg">
                      {entry.commentary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowShare((value) => !value)}
                      className="rounded-full border border-[rgba(197,164,110,0.35)] bg-[rgba(197,164,110,0.1)] text-[#C5A46E] hover:bg-[rgba(197,164,110,0.16)]"
                    >
                      <Share2 className="size-4" />
                      {showShare ? "Hide share card" : "Share this moment"}
                    </Button>
                    <Link
                      href="/history"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[rgba(245,241,233,0.5)] transition-colors hover:text-[#C5A46E]"
                    >
                      <Archive className="size-4" />
                      History archive
                    </Link>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[rgba(245,241,233,0.4)]">
                      <Sparkles className="size-3.5 text-[#C5A46E]" />
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
                    "mt-8 rounded-2xl border border-[rgba(197,164,110,0.12)] bg-[rgba(10,22,40,0.45)] p-6"
                  )}
                >
                  <p className="text-sm leading-relaxed text-[rgba(245,241,233,0.55)]">
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
