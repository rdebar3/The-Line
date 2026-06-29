"use client";

import { Check, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  FREE_VS_PREMIUM_ROWS,
  PREMIUM_PRICE_LABEL,
  UNLOCK_CTA_LABEL,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type FreeVsPremiumProps = {
  variant?: "card" | "compact" | "inline" | "hub";
  showCta?: boolean;
  className?: string;
};

function isFreeLocked(free: string) {
  const normalized = free.toLowerCase();
  return normalized === "locked" || normalized === "not included";
}

function FreeFeatureItem({ label, free }: { label: string; free: string }) {
  const locked = isFreeLocked(free);

  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border",
          locked
            ? "border-navy-border/50 bg-navy/60 text-muted-foreground/50"
            : "border-navy-border/40 bg-navy-border/15 text-muted-foreground/70"
        )}
        aria-hidden
      >
        {locked ? (
          <Lock className="size-3.5" strokeWidth={2.25} />
        ) : (
          <Check className="size-3.5" strokeWidth={2.25} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            locked ? "text-muted-foreground/60" : "text-foreground/70"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-xs leading-relaxed",
            locked ? "text-muted-foreground/45" : "text-muted-foreground/75"
          )}
        >
          {locked ? "Not included" : free}
        </p>
      </div>
    </li>
  );
}

function FullFeatureItem({ label, full }: { label: string; full: string }) {
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-gold/35 bg-gold/20 text-gold shadow-[0_0_10px_rgba(201,162,39,0.15)]"
        aria-hidden
      >
        <Check className="size-3.5" strokeWidth={2.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-gold/90">{full}</p>
      </div>
    </li>
  );
}

function HubComparison({ showCta }: { showCta: boolean }) {
  const { openUnlockModal } = useSubscription();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy-border/60 bg-navy-elevated/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(201,162,39,0.12)_0%,transparent_55%)]"
      />

      <div className="relative px-4 py-5 sm:px-8 sm:py-8">
        <header className="text-center sm:text-left">
          <p className="section-eyebrow">Free vs Full</p>
          <h2 className="mt-1.5 font-heading text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
            Choose Your Depth
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm text-muted-foreground sm:mx-0">
            Start free. Unlock everything with one purchase.
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          {/* Free — subdued baseline */}
          <div className="order-2 flex flex-col rounded-xl border border-navy-border/50 bg-navy/20 p-5 lg:order-1">
            <div className="border-b border-navy-border/40 pb-4">
              <p className="font-heading text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground/80 uppercase">
                Free Preview
              </p>
              <p className="mt-1 font-heading text-xl font-bold text-foreground/80">
                $0
              </p>
            </div>
            <ul className="mt-1 divide-y divide-navy-border/30">
              {FREE_VS_PREMIUM_ROWS.map((row) => (
                <FreeFeatureItem
                  key={row.label}
                  label={row.label}
                  free={row.free}
                />
              ))}
            </ul>
          </div>

          {/* Full — gold hero column with embedded CTA */}
          <div className="relative order-1 flex flex-col overflow-hidden rounded-xl border-2 border-gold/55 bg-gradient-to-b from-gold/[0.16] via-gold/[0.07] to-navy/70 p-5 shadow-[0_0_48px_rgba(201,162,39,0.2)] ring-1 ring-gold/25 lg:order-2 lg:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 right-0 size-40 rounded-full bg-gold/15 blur-3xl"
            />
            <div
              aria-hidden
              className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/80 to-transparent"
            />

            <div className="relative border-b border-gold/25 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] text-gold uppercase">
                <Sparkles className="size-3" />
                Recommended
              </span>
              <p className="mt-3 font-heading text-[0.65rem] font-semibold tracking-[0.22em] text-gold uppercase">
                Full Access
              </p>
              <p className="mt-1 font-heading text-3xl font-bold tracking-tight text-gold score-glow">
                {PREMIUM_PRICE_LABEL}
              </p>
              <p className="mt-0.5 text-xs font-medium text-gold/75">
                One-time · No subscription
              </p>
            </div>

            <ul className="relative mt-1 flex-1 divide-y divide-gold/15">
              {FREE_VS_PREMIUM_ROWS.map((row) => (
                <FullFeatureItem key={row.label} label={row.label} full={row.full} />
              ))}
            </ul>

            {showCta && (
              <div className="relative mt-5 border-t border-gold/20 pt-5">
                <Button
                  onClick={openUnlockModal}
                  className="btn-gold btn-cta h-14 w-full rounded-xl text-base font-bold shadow-[0_0_36px_rgba(201,162,39,0.35)] sm:text-lg"
                >
                  <Sparkles className="size-4 shrink-0" />
                  {UNLOCK_CTA_LABEL}
                </Button>
                <p className="mt-2.5 text-center text-[0.65rem] font-medium tracking-[0.12em] text-gold/65 uppercase">
                  Instant unlock · Lifetime access
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FreeVsPremium({
  variant = "card",
  showCta = true,
  className,
}: FreeVsPremiumProps) {
  const { isPremium, isLoading, openUnlockModal } = useSubscription();

  if (isLoading || isPremium) return null;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "rounded-xl border border-gold/15 bg-navy/40 px-4 py-3 text-center text-xs text-muted-foreground",
          className
        )}
      >
        <span className="font-semibold text-gold">Free preview</span>
        {" · "}
        Unlock for unlimited {CHARACTER_NAME} counsel, all scenarios, and full
        depth — {PREMIUM_PRICE_LABEL} one-time.
      </div>
    );
  }

  if (variant === "hub") {
    return (
      <section className={cn("animate-fade-up-delay-4", className)}>
        <HubComparison showCta={showCta} />
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-navy/40 p-4",
          className
        )}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
            Full Access
          </p>
          <p className="font-heading text-lg font-bold text-gold">
            {PREMIUM_PRICE_LABEL}
          </p>
        </div>
        <ul className="mt-3 space-y-2.5">
          {FREE_VS_PREMIUM_ROWS.slice(0, 3).map((row) => {
            const locked = isFreeLocked(row.free);
            return (
              <li key={row.label} className="flex items-start gap-2.5 text-xs">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md",
                    locked
                      ? "bg-navy-border/30 text-muted-foreground/50"
                      : "bg-gold/20 text-gold"
                  )}
                  aria-hidden
                >
                  {locked ? (
                    <Lock className="size-3" />
                  ) : (
                    <Check className="size-3" strokeWidth={2.5} />
                  )}
                </span>
                <span className="min-w-0 flex-1 leading-snug text-foreground/85">
                  {row.label}
                  <span className="text-muted-foreground"> — {row.full}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {showCta && (
          <Button
            onClick={openUnlockModal}
            className="btn-gold btn-cta mt-4 h-11 w-full rounded-xl font-semibold"
          >
            <Sparkles className="size-4" />
            {UNLOCK_CTA_LABEL}
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className={cn("animate-fade-up-delay-4", className)}>
      <HubComparison showCta={showCta} />
    </section>
  );
}