"use client";

import { useCallback, useState } from "react";
import { ExternalLink, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ThisDay250Entry } from "@/lib/this-day-250";
import type { ThisDay250AdminLogEntry } from "@/lib/this-day-250-cache";

type AdminResponse = {
  logs: ThisDay250AdminLogEntry[];
  entries: ThisDay250Entry[];
  total: number;
  error?: string;
};

export default function AdminThisDay250Page() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!secret.trim()) {
      setError("Enter the operator secret.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/this-day-250", {
        headers: { Authorization: `Bearer ${secret.trim()}` },
      });
      const payload = (await res.json()) as AdminResponse;

      if (!res.ok) {
        setError(payload.error ?? "Unauthorized.");
        setData(null);
        return;
      }

      setData(payload);
    } catch {
      setError("Failed to load admin logs.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [secret]);

  return (
    <div className="min-h-screen bg-navy px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="size-8 text-gold" />
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              Operator View — This Day 250
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Spot-check daily generated entries and citations after publish.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-navy-elevated p-5 sm:p-6">
          <label
            htmlFor="operator-secret"
            className="text-sm font-medium text-muted-foreground"
          >
            Operator secret
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="operator-secret"
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="OPERATOR_SECRET"
              className="flex-1 rounded-xl border border-gold/20 bg-navy px-4 py-2.5 text-sm outline-none focus:border-gold/50"
            />
            <Button
              type="button"
              onClick={() => void loadLogs()}
              disabled={loading}
              className="btn-gold"
            >
              {loading ? "Loading…" : "Load entries"}
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-crimson">{error}</p>
          )}
        </div>

        {data && (
          <div className="mt-8 space-y-4">
            <p className="text-sm font-medium text-gold">
              {data.total} total archived · showing {data.logs.length} recent
            </p>
            {data.logs.map((log) => (
              <article
                key={log.calendarDate}
                className="rounded-2xl border border-gold/20 bg-navy-elevated/80 p-5"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-gold">
                    {log.calendarDate}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground">
                    {log.historicalDate}
                  </span>
                  {!log.exactDateMatch && (
                    <span className="rounded border border-gold/25 px-1.5 py-0.5 text-[0.65rem] text-gold">
                      ±3 day fallback
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {log.grokModel} · {log.generatedAt}
                  </span>
                </div>
                <h2 className="mt-2 font-heading text-lg font-bold">
                  {log.eventTitle}
                </h2>
                <a
                  href={log.citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
                >
                  {log.citationLabel}: {log.citationUrl}
                  <ExternalLink className="size-3.5" />
                </a>
                {log.allCitations.length > 1 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {log.allCitations.map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gold"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}