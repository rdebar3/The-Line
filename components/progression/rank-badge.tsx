"use client";

import { Shield } from "lucide-react";

import type { MilitaryRank } from "@/lib/progression";
import { cn } from "@/lib/utils";

type RankBadgeProps = {
  rank: MilitaryRank;
  size?: "sm" | "md" | "lg";
  showAbbreviation?: boolean;
  celebrate?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    wrapper: "size-14",
    insignia: "text-lg",
    title: "text-[0.6rem]",
    abbr: "text-[0.55rem]",
  },
  md: {
    wrapper: "size-20",
    insignia: "text-2xl",
    title: "text-xs",
    abbr: "text-[0.65rem]",
  },
  lg: {
    wrapper: "size-28",
    insignia: "text-3xl",
    title: "text-sm",
    abbr: "text-xs",
  },
};

export function RankBadge({
  rank,
  size = "md",
  showAbbreviation = true,
  celebrate = false,
  className,
}: RankBadgeProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 bg-navy/80 shadow-[0_0_30px_rgba(201,162,39,0.15)]",
          sizes.wrapper,
          celebrate && "animate-glow-pulse"
        )}
        style={{
          borderColor: `${rank.color}80`,
          boxShadow: `0 0 24px ${rank.color}30`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-1 rounded-full border border-white/5"
        />
        <Shield
          className="absolute size-[55%] text-white/10"
          strokeWidth={1}
        />
        <span
          className={cn("relative z-10 font-heading font-bold", sizes.insignia)}
          style={{ color: rank.color }}
        >
          {rank.insignia}
        </span>
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-heading font-semibold tracking-wide text-foreground uppercase",
            sizes.title
          )}
        >
          {rank.title}
        </p>
        {showAbbreviation && (
          <p
            className={cn(
              "mt-0.5 font-mono tracking-[0.2em] text-muted-foreground uppercase",
              sizes.abbr
            )}
          >
            {rank.abbreviation}
          </p>
        )}
      </div>
    </div>
  );
}