import Link from "next/link";
import { Shield } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/legal-disclaimers";
import { cn } from "@/lib/utils";

const footerLinks = [
  { label: "Declaration", href: "/declaration" },
  { label: "Constitution", href: "/constitution" },
  { label: "Bill of Rights", href: "/bill-of-rights" },
  { label: "Training", href: "/rights-under-pressure" },
  { label: "Arsenal", href: "/arsenal" },
  { label: "Privacy", href: "/privacy" },
];

type SiteFooterProps = {
  tagline?: string;
  compact?: boolean;
  variant?: "default" | "hub";
};

export function SiteFooter({
  tagline = "Stand on principle. Hold the line.",
  compact = false,
  variant = "default",
}: SiteFooterProps) {
  if (variant === "hub") {
    return (
      <footer className="mt-14 border-t border-navy-border/40 pt-10 sm:mt-16 sm:pt-12">
        <div className="flex flex-col items-center text-center">
          <GuardianCharacter mood="neutral" size="sm" className="opacity-90" />
          <p className="mt-4 font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase sm:text-sm">
            Made by {CHARACTER_NAME}
          </p>
          <p className="mt-4 max-w-xl text-pretty text-xs leading-relaxed text-muted-foreground/80 sm:text-sm">
            {EDUCATIONAL_DISCLAIMER}
          </p>
          <nav
            aria-label="Site links"
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-wide text-muted-foreground/70 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.18em] text-muted-foreground/45 uppercase">
            <Shield className="size-3 text-gold/60" />
            {tagline}
          </p>
        </div>
      </footer>
    );
  }

  if (compact) {
    return (
      <footer className="mt-auto pt-12 text-center sm:pt-16">
        <p className="text-xs tracking-widest text-muted-foreground/60 uppercase">
          {tagline}
        </p>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-navy-border/40 pt-12 sm:pt-16">
      <section className="rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="shrink-0">
            <GuardianCharacter mood="neutral" size="sm" showLabel />
          </div>
          <div className="max-w-2xl">
            <h2 className="section-eyebrow text-xs">About The Line</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The Line is civic defense for Americans who refuse to let
              constitutional rights become slogans. Study the founding documents,
              train under real pressure, and build the judgment to hold the line
              when power tests the Constitution.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Guided by {CHARACTER_NAME}, your field advisor — Defender Score,
              rank progression, and Grok-powered counsel keep you sharp between
              the moments that matter.
            </p>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground/70 sm:justify-start">
              <Shield className="size-3.5 text-gold" />
              Not legal advice — principled training for citizen-defenders.
            </p>
          </div>
        </div>

        <nav
          aria-label="Site links"
          className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </section>

      <p
        className={cn(
          "mt-8 text-center text-xs tracking-widest text-muted-foreground/50 uppercase"
        )}
      >
        {tagline}
      </p>
    </footer>
  );
}