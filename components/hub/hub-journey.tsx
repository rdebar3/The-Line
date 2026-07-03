"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  Award,
  Bookmark,
  BookOpen,
  Brain,
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
    id: "my-lines",
    label: "Lines",
    description: "Your saved constitutional passages",
    href: "/my-lines",
    icon: Bookmark,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  },
  {
    id: "certifications",
    label: "Certify",
    description: "Earn credentials for founding document mastery",
    href: "/certifications",
    icon: Award,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  },
  {
    id: "intelligence",
    label: "Adapt",
    description: "Weak-area analysis & personalized missions",
    href: "#intelligence",
    icon: Brain,
    accent: "gold",
    iconClass: "text-gold border-gold/35 bg-gold/15",
    hoverClass:
      "hover:border-gold/45 hover:bg-gold/[0.08] hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
    glowClass: "group-hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
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
    "path-card group relative flex h-full min-h-[7.5rem] flex-col items-center rounded-xl border border-navy-border/60 bg-navy-elevated/40 p-3 text-center transition-all duration-300 hover:-translate-y-0.5 sm:min-h-[8rem] sm:p-4 lg:min-h-[8.5rem]",
    step.hoverClass
  );

  const content = (
    <>
      <span className="absolute top-3 left-3 font-heading text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground/50 sm:top-4 sm:left-4">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "mt-0.5 flex size-9 items-center justify-center rounded-lg border transition-all duration-300 sm:size-10",
          step.iconClass
        )}
      >
        <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
      </span>
      <span className="mt-2 font-heading text-sm font-semibold tracking-[0.1em] text-foreground/90 uppercase sm:text-base">
        {step.label}
      </span>
      <span className="mt-1 max-w-[10rem] text-pretty text-[0.65rem] leading-relaxed text-muted-foreground/80 sm:text-[0.7rem] lg:max-w-none">
        {step.description}
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
      className="rounded-2xl border border-navy-border/50 bg-navy-elevated/30"
    >
      <div className="relative px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <header className="mb-4 text-center sm:mb-5">
          <p className="font-heading text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase sm:text-xs">
            Explore more
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80 sm:text-sm">
            Track, rank, study, and ask counsel after your first drill.
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


      </div>
    </section>
  );
}