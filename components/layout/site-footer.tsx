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
  tagline = "Know the standard. Hold the line.",
  compact = false,
  variant = "default",
}: SiteFooterProps) {
  if (variant === "hub") {
    return (
      <footer className="mt-16 border-t border-[rgba(197,164,110,0.1)] pt-10 sm:mt-20 sm:pt-12">
        <nav
          aria-label="Site links"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2.5"
        >
          {FOOTER_NAV.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-xs font-medium tracking-wide text-[rgba(245,241,233,0.4)] transition-colors hover:text-[#C5A46E]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mx-auto mt-6 max-w-xl text-center text-pretty text-[0.7rem] leading-relaxed text-[rgba(245,241,233,0.32)] sm:text-xs">
          {EDUCATIONAL_DISCLAIMER}
        </p>
        <p className="mt-8 flex items-center justify-center gap-2 font-heading text-[0.7rem] tracking-[0.14em] text-[rgba(197,164,110,0.55)]">
          <Shield className="size-3 text-[rgba(197,164,110,0.55)]" />
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
              key={link.href + link.label}
              href={link.href}
              className="text-xs font-medium text-[rgba(245,241,233,0.4)] transition-colors hover:text-[#C5A46E]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="font-heading text-xs tracking-widest text-[rgba(197,164,110,0.45)]">
          {tagline}
        </p>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-[rgba(197,164,110,0.1)] pt-10 sm:pt-12">
      <nav
        aria-label="Site links"
        className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start"
      >
        {FOOTER_NAV.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="text-xs font-medium tracking-wide text-[rgba(245,241,233,0.45)] transition-colors hover:text-[#C5A46E]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p
        className={cn(
          "mt-8 text-center font-heading text-xs tracking-widest text-[rgba(197,164,110,0.4)] sm:text-left"
        )}
      >
        {tagline}
      </p>
    </footer>
  );
}
