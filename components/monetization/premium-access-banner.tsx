"use client";

import { Sparkles } from "lucide-react";

import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { cn } from "@/lib/utils";

type PremiumAccessBannerProps = {
  className?: string;
  compact?: boolean;
};

export function PremiumAccessBanner({
  className,
  compact = false,
}: PremiumAccessBannerProps) {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading || !isPremium) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-gold/25 bg-gradient-to-b from-gold/[0.08] to-transparent text-center",
        compact ? "px-4 py-3" : "px-5 py-4 sm:px-6",
        className
      )}
    >
      <p
        className={cn(
          "flex items-center justify-center gap-2 font-heading font-semibold tracking-wide text-gold uppercase",
          compact ? "text-xs" : "text-sm"
        )}
      >
        <Sparkles className={cn(compact ? "size-3.5" : "size-4")} />
        Full Access Active
      </p>
      {!compact && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Premium unlocked — {CHARACTER_NAME} training, unlimited scenarios, and
          the full Arsenal are yours.
        </p>
      )}
    </div>
  );
}