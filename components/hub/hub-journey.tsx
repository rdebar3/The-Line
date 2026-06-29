"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Medal,
  MessageSquare,
  Swords,
  Trophy,
} from "lucide-react";

import { CHARACTER_NAME } from "@/lib/guardian";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "progression",
    label: "Track",
    description: "Defender Score, streaks & daily missions",
    href: "#progression",
    icon: Medal,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  },
  {
    id: "training",
    label: "Train",
    description: "Constitutional scenarios under pressure",
    href: "/rights-under-pressure",
    icon: Swords,
    accent: "crimson",
    iconClass: "text-crimson border-crimson/35 bg-crimson/15",
    hoverClass:
      "hover:border-crimson/45 hover:bg-crimson/[0.08] hover:shadow-[0_8px_40px_rgba(185,28,28,0.2)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(185,28,28,0.3)]",
  },
  {
    id: "leaderboard",
    label: "Rank",
    description: "Leaderboard & weekly challenges",
    href: "#leaderboard",
    icon: Trophy,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  },
  {
    id: "documents",
    label: "Study",
    description: "Declaration, Constitution, Bill of Rights",
    href: "#documents",
    icon: BookOpen,
    accent: "blue",
    iconClass:
      "text-constitution-blue-light border-constitution-blue/35 bg-constitution-blue/15",
    hoverClass:
      "hover:border-constitution-blue/45 hover:bg-constitution-blue/[0.08] hover:shadow-[0_8px_40px_rgba(59,89,152,0.22)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(59,89,152,0.35)]",
  },
  {
    id: "grok",
    label: "Ask",
    description: `Constitutional counsel from ${CHARACTER_NAME}`,
    href: "#counsel",
    icon: MessageSquare,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  },
] as const;

function PathCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const Icon = step.icon;
  const isAnchor = step.href.startsWith("#");

  const className = cn(
    "path-card group premium-card relative flex h-full min-h-[9.5rem] flex-col items-center rounded-2xl border border-navy-border/70 bg-navy-elevated/60 p-4 text-center transition-all duration-300 hover:-translate-y-1 sm:min-h-[10.5rem] sm:p-5 lg:min-h-[11.5rem] lg:p-6",
    step.hoverClass
  );

  const content = (
    <>
      <span className="absolute top-3 left-3 font-heading text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground/50 sm:top-4 sm:left-4">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "mt-1 flex size-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 sm:size-14 lg:size-16",
          step.iconClass,
          step.glowClass
        )}
      >
        <Icon className="size-6 sm:size-7 lg:size-8" strokeWidth={1.75} />
      </span>
      <span className="mt-3 font-heading text-base font-bold tracking-[0.12em] text-foreground uppercase sm:mt-4 sm:text-lg lg:text-xl">
        {step.label}
      </span>
      <span className="mt-1.5 max-w-[11rem] text-pretty text-[0.7rem] leading-relaxed text-muted-foreground sm:text-xs lg:max-w-none lg:text-sm">
        {step.description}
      </span>
      <span className="mt-auto flex items-center gap-1 pt-3 text-[0.65rem] font-semibold tracking-wide text-gold/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-xs">
        Go
        <ArrowRight className="size-3.5" />
      </span>
    </>
  );

  if (isAnchor) {
    return (
      <a href={step.href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={step.href} className={className}>
      {content}
    </Link>
  );
}

export function HubJourney() {
  return (
    <section
      aria-label="Training path"
      className="hub-card-shell shadow-[0_0_80px_rgba(201,162,39,0.08)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.1)_0%,transparent_65%)]"
      />
      <div aria-hidden className="hub-card-accent" />

      <div className="relative px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="hub-section-header">
          <p className="section-eyebrow">Your Path</p>
          <p className="hub-section-subtitle sm:text-base">
            Five steps from first drill to full constitutional command.
          </p>
        </header>

        {/* Mobile & tablet grid */}
        <nav className="lg:hidden">
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {steps.map((step, index) => (
              <li key={step.id} className="min-w-0">
                <PathCard step={step} index={index} />
              </li>
            ))}
          </ol>
        </nav>

        {/* Desktop row with flow connectors */}
        <nav className="hidden lg:block">
          <ol className="flex items-stretch">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <li className="min-w-0 flex-1">
                  <PathCard step={step} index={index} />
                </li>
                {index < steps.length - 1 && (
                  <li
                    aria-hidden
                    className="flex w-7 shrink-0 items-center justify-center self-center"
                  >
                    <ChevronRight
                      className="size-5 text-gold/45"
                      strokeWidth={2}
                    />
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        {/* Flow indicator */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 sm:mt-6">
          {steps.map((step, index) => (
            <span key={step.id} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-heading text-xs font-bold tracking-[0.15em] uppercase sm:text-sm",
                  index === 1
                    ? "text-crimson"
                    : index === 3
                      ? "text-constitution-blue-light"
                      : "text-gold"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight
                  className="size-3.5 text-muted-foreground/50 sm:size-4"
                  aria-hidden
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}