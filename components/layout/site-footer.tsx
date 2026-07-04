import Link from "next/link";
import { Shield } from "lucide-react";

import { FOOTER_NAV } from "@/lib/site-nav";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/legal-disclaimers";
import { cn } from "@/lib/utils";

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
      <footer className="mt-12 border-t border-navy-border/40 pt-8 sm:mt-14 sm:pt-10">
        <nav
          aria-label="Site links"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2"
        >
          {FOOTER_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-wide text-muted-foreground/70 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mx-auto mt-5 max-w-xl text-center text-pretty text-[0.7rem] leading-relaxed text-muted-foreground/65 sm:text-xs">
          {EDUCATIONAL_DISCLAIMER}
        </p>
        <p className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.18em] text-muted-foreground/45 uppercase">
          <Shield className="size-3 text-gold/60" />
          {tagline}
        </p>
      </footer>
    );
  }

  if (compact) {
    return (
      <footer className="mt-auto pt-10 text-center sm:pt-12">
        <nav
          aria-label="Site links"
          className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2"
        >
          {FOOTER_NAV.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-muted-foreground/60 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs tracking-widest text-muted-foreground/60 uppercase">
          {tagline}
        </p>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-navy-border/40 pt-10 sm:pt-12">
      <nav
        aria-label="Site links"
        className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start"
      >
        {FOOTER_NAV.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p
        className={cn(
          "mt-8 text-center text-xs tracking-widest text-muted-foreground/50 uppercase sm:text-left"
        )}
      >
        {tagline}
      </p>
    </footer>
  );
}