"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

import { CHARACTER_NAME } from "@/lib/guardian";
import type { ThisDay250Entry } from "@/lib/this-day-250";
import { HISTORY_YEARS_AGO } from "@/lib/this-day-250";

type ArchiveResponse = {
  entries: ThisDay250Entry[];
  total: number;
  cached: boolean;
  message?: string;
};

export function HistoryArchiveExperience() {
  const [entries, setEntries] = useState<ThisDay250Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/this-day-250?mode=archive&limit=100")
      .then((res) => res.json())
      .then((data: ArchiveResponse) => {
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        setEntries([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell max-w-4xl pb-16">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-gold/25 px-2.5 text-[0.8rem] font-medium text-gold transition-colors hover:bg-gold/10"
        >
          <ArrowLeft className="size-3.5" />
          Back to Hub
        </Link>
      </div>

      <div className="command-glass rounded-3xl px-5 py-8 sm:px-10 sm:py-11">
        <p className="section-eyebrow">History Archive</p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          This Day {HISTORY_YEARS_AGO} Years Ago
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every daily briefing generated for The Line — sourced from reputable
          history archives and debriefed by {CHARACTER_NAME}. Browse
          chronologically, newest first.
        </p>
        {!loading && total > 0 && (
          <p className="mt-3 text-sm font-medium text-gold">
            {total} {total === 1 ? "entry" : "entries"} archived
          </p>
        )}
      </div>

      {loading && (
        <p className="mt-8 text-sm text-muted-foreground">
          Loading archive…
        </p>
      )}

      {!loading && entries.length === 0 && (
        <div className="mt-8 rounded-2xl border border-gold/20 bg-navy/40 p-6">
          <p className="text-sm text-muted-foreground">
            No archived entries yet. Daily briefings appear here after the
            scheduled generation runs.
          </p>
        </div>
      )}

      <ul className="mt-8 space-y-5">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-2xl border border-gold/20 bg-navy/50 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="size-4 text-gold" />
              <span className="font-heading text-sm font-semibold text-gold">
                Published {entry.id}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {entry.historicalDateLabel}
              </span>
              {!entry.exactDateMatch && entry.dateRangeNote && (
                <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                  {entry.dateRangeNote}
                </span>
              )}
            </div>
            <h2 className="mt-3 font-heading text-xl font-bold text-foreground">
              {entry.eventTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {entry.summary.replace(/\[\[\d+\]\]\([^)]+\)/g, "")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold text-gold">{CHARACTER_NAME}:</span>{" "}
              {entry.commentary}
            </p>
            <a
              href={entry.citationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-light"
            >
              {entry.citationLabel}
              <ExternalLink className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}