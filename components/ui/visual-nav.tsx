"use client";

/**
 * Shared luxury-minimalist visual navigation primitives:
 * gold progress rings/bars, era timeline, section & nav line icons.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookMarked,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Feather,
  FileText,
  Gavel,
  HeartHandshake,
  Landmark,
  Map,
  MapPin,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import {
  resolveNavIconKind,
  resolveSectionKind,
  sectionKindLabel,
  type NavIconKind,
  type SectionKind,
} from "@/lib/section-icons";
import { cn } from "@/lib/utils";

/* ── Progress ring ───────────────────────────────────────────────────── */

export function ProgressRing({
  value,
  size = 40,
  strokeWidth = 2.5,
  className,
  trackClassName,
  fillClassName,
  children,
  label,
}: {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  children?: ReactNode;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(pct)}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-[rgba(197,164,110,0.15)]", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            "stroke-[#C5A46E] transition-[stroke-dashoffset] duration-700 ease-out",
            fillClassName
          )}
          style={{
            filter: pct > 0 ? "drop-shadow(0 0 4px rgba(197,164,110,0.35))" : undefined,
          }}
        />
      </svg>
      {children != null && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {children}
        </span>
      )}
    </div>
  );
}

/* ── Gold progress bar ───────────────────────────────────────────────── */

export function GoldProgressBar({
  value,
  className,
  trackClassName,
  fillClassName,
  label,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "archive-progress-track h-[3px] overflow-hidden rounded-full",
        className,
        trackClassName
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(pct)}% complete`}
    >
      <div
        className={cn(
          "archive-progress-fill h-full rounded-full transition-[width] duration-500 ease-out",
          fillClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ── Icon maps ───────────────────────────────────────────────────────── */

const SECTION_ICONS: Record<SectionKind, LucideIcon> = {
  preamble: ScrollText,
  rights: Shield,
  powers: Landmark,
  grievance: Gavel,
  structure: Building2,
  declaration: Feather,
  pledge: HeartHandshake,
  principle: Sparkles,
  amendment: Scale,
  consent: Users,
  general: BookOpen,
};

const NAV_ICONS: Record<NavIconKind, LucideIcon> = {
  history: CalendarDays,
  documents: BookMarked,
  path: Map,
  defenders: Award,
  home: Landmark,
  privacy: FileText,
  declaration: Feather,
  constitution: Landmark,
  "bill-of-rights": Scale,
};

export function SectionTypeIcon({
  kind,
  className,
  strokeWidth = 1.6,
}: {
  kind: SectionKind;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = SECTION_ICONS[kind] ?? BookOpen;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function NavTypeIcon({
  kind,
  className,
  strokeWidth = 1.6,
}: {
  kind: NavIconKind;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = NAV_ICONS[kind] ?? BookOpen;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function SectionIconBadge({
  section,
  passageId,
  active,
  read,
  size = "md",
  className,
}: {
  section: string;
  passageId?: string;
  active?: boolean;
  read?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const kind = resolveSectionKind(section, passageId);
  const dim = size === "sm" ? "size-6" : "size-7";
  const iconDim = size === "sm" ? "size-3" : "size-3.5";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border transition-all duration-300",
        dim,
        read
          ? "border-[#C5A46E]/55 bg-[#C5A46E]/15 text-[#C5A46E]"
          : "border-[rgba(197,164,110,0.2)] bg-[rgba(197,164,110,0.06)] text-[rgba(197,164,110,0.75)]",
        active && !read && "border-[#C5A46E]/55 bg-[rgba(197,164,110,0.12)] text-[#C5A46E]",
        className
      )}
      title={sectionKindLabel(kind)}
    >
      {read ? (
        <Check className={cn(iconDim, "stroke-[2.5]")} />
      ) : (
        <SectionTypeIcon kind={kind} className={iconDim} />
      )}
    </span>
  );
}

export function NavIconForItem({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const kind = resolveNavIconKind(href, label);
  return <NavTypeIcon kind={kind} className={className} />;
}

/* ── Revolutionary era timeline ──────────────────────────────────────── */

export type EraMilestone = {
  year: string;
  label: string;
  href?: string;
  /** Highlight the current document */
  current?: boolean;
  complete?: boolean;
};

const DEFAULT_ERA: EraMilestone[] = [
  { year: "1776", label: "Declaration", href: "/declaration" },
  { year: "1787", label: "Constitution", href: "/constitution" },
  { year: "1791", label: "Bill of Rights", href: "/bill-of-rights" },
];

export function EraTimeline({
  milestones = DEFAULT_ERA,
  currentYear,
  currentSlug,
  className,
  variant = "dark",
}: {
  milestones?: EraMilestone[];
  currentYear?: string;
  currentSlug?: string;
  className?: string;
  variant?: "dark" | "parchment";
}) {
  const items = milestones.map((m) => ({
    ...m,
    current:
      m.current ||
      (currentYear != null && m.year === currentYear) ||
      (currentSlug != null && m.href?.includes(currentSlug)),
  }));

  const isParchment = variant === "parchment";

  return (
    <nav
      aria-label="Revolutionary era milestones"
      className={cn("era-timeline", className)}
    >
      <ol className="relative flex items-start justify-between gap-1">
        {/* Connector line */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-[0.7rem] right-[12%] left-[12%] h-px",
            isParchment
              ? "bg-gradient-to-r from-transparent via-[rgba(139,115,85,0.35)] to-transparent"
              : "bg-gradient-to-r from-transparent via-[rgba(197,164,110,0.28)] to-transparent"
          )}
        />

        {items.map((item) => {
          const content = (
            <>
              <span
                className={cn(
                  "relative z-[1] flex size-6 items-center justify-center rounded-full border transition-all duration-300 sm:size-7",
                  item.current
                    ? isParchment
                      ? "border-[#C5A46E] bg-[#C5A46E]/20 text-[#8B7355] shadow-[0_0_12px_rgba(197,164,110,0.25)]"
                      : "border-[#C5A46E] bg-[#C5A46E]/18 text-[#C5A46E] shadow-[0_0_14px_rgba(197,164,110,0.3)]"
                    : item.complete
                      ? "border-[#C5A46E]/50 bg-[#C5A46E]/12 text-[#C5A46E]"
                      : isParchment
                        ? "border-[rgba(139,115,85,0.35)] bg-[rgba(248,244,236,0.8)] text-[#8B7355]/80"
                        : "border-[rgba(197,164,110,0.22)] bg-[rgba(10,22,40,0.6)] text-[rgba(197,164,110,0.55)]"
                )}
              >
                {item.complete && !item.current ? (
                  <Check className="size-3 stroke-[2.5]" />
                ) : (
                  <MapPin className="size-3" strokeWidth={1.75} />
                )}
              </span>
              <span
                className={cn(
                  "mt-2 text-[0.6rem] font-semibold tracking-[0.16em] uppercase sm:text-[0.65rem]",
                  item.current
                    ? isParchment
                      ? "text-[#8B7355]"
                      : "text-[#C5A46E]"
                    : isParchment
                      ? "text-[#8B7355]/70"
                      : "text-[rgba(245,241,233,0.4)]"
                )}
              >
                {item.year}
              </span>
              <span
                className={cn(
                  "mt-0.5 max-w-[5.5rem] text-center text-[0.65rem] leading-snug sm:max-w-none sm:text-[0.7rem]",
                  item.current
                    ? isParchment
                      ? "font-medium text-[#1a1520]"
                      : "font-medium text-[#F5F1E9]"
                    : isParchment
                      ? "text-[#5c5346]"
                      : "text-[rgba(245,241,233,0.45)]"
                )}
              >
                {item.label}
              </span>
            </>
          );

          if (item.href && !item.current) {
            return (
              <li key={item.year + item.label} className="relative z-[1] flex flex-1 flex-col items-center">
                <a
                  href={item.href}
                  className="flex flex-col items-center rounded-lg px-1 py-1 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(197,164,110,0.5)]"
                >
                  {content}
                </a>
              </li>
            );
          }

          return (
            <li
              key={item.year + item.label}
              className="relative z-[1] flex flex-1 flex-col items-center"
              aria-current={item.current ? "step" : undefined}
            >
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Compact icon chip for section headers ───────────────────────────── */

export function SectionMarker({
  section,
  passageId,
  index,
  className,
  tone = "parchment",
}: {
  section: string;
  passageId?: string;
  index?: number;
  className?: string;
  tone?: "parchment" | "navy";
}) {
  const kind = resolveSectionKind(section, passageId);
  const isParchment = tone === "parchment";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-md border",
          isParchment
            ? "border-[rgba(139,115,85,0.28)] bg-[rgba(197,164,110,0.08)] text-[#8B7355]"
            : "border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)] text-[#C5A46E]"
        )}
      >
        <SectionTypeIcon kind={kind} className="size-3" />
      </span>
      <span
        className={cn(
          "text-[0.625rem] font-semibold tracking-[0.22em] uppercase",
          isParchment ? "text-[#8B7355]" : "text-[rgba(245,241,233,0.5)]"
        )}
      >
        {section}
      </span>
      {typeof index === "number" && (
        <span
          className={cn(
            "font-heading text-[0.65rem] tracking-widest",
            isParchment ? "text-[#8B7355]/65" : "text-[rgba(245,241,233,0.35)]"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
    </span>
  );
}

/* ── Path / training step icons ──────────────────────────────────────── */

export const PATH_STEP_ICONS = {
  read: BookOpen,
  drill: Target,
  scenario: Shield,
  certify: Award,
} as const;

export function PathStatusDot({
  status,
  className,
}: {
  status: "locked" | "available" | "in-progress" | "complete";
  className?: string;
}) {
  if (status === "complete") {
    return (
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border border-[#C5A46E]/50 bg-[#C5A46E]/15 text-[#C5A46E]",
          className
        )}
      >
        <Check className="size-3.5 stroke-[2.5]" />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className={cn("relative flex size-8 shrink-0 items-center justify-center", className)}>
        <span className="absolute inset-0 animate-ping rounded-full bg-[#C5A46E]/20" />
        <span className="relative flex size-8 items-center justify-center rounded-full border border-[#C5A46E]/55 bg-[#C5A46E]/10 text-[#C5A46E]">
          <span className="size-2 rounded-full bg-[#C5A46E]" />
        </span>
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(245,241,233,0.1)] bg-[rgba(10,22,40,0.5)] text-[rgba(245,241,233,0.35)]",
          className
        )}
      >
        <span className="size-1.5 rounded-full bg-current opacity-60" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.25)] bg-[rgba(197,164,110,0.05)] text-[rgba(197,164,110,0.55)]",
        className
      )}
    >
      <span className="size-1.5 rounded-full border border-current" />
    </span>
  );
}
