"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { PRIMARY_NAV, isNavItemActive } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition-colors sm:text-sm",
        active
          ? "border border-gold/25 bg-gold/12 text-gold shadow-[0_0_16px_rgba(201,162,39,0.12)]"
          : "text-muted-foreground hover:border hover:border-gold/15 hover:bg-navy-elevated/80 hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

type SiteNavProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function SiteNav({ mobileOpen, onMobileOpenChange }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={isNavItemActive(pathname, item)}
          />
        ))}
      </nav>

      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobile-site-nav"
        onClick={() => onMobileOpenChange(!mobileOpen)}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-navy-border/70 bg-navy-elevated/50 text-muted-foreground transition-colors hover:border-gold/25 hover:text-foreground md:hidden"
      >
        {mobileOpen ? (
          <X className="size-4" aria-hidden />
        ) : (
          <Menu className="size-4" aria-hidden />
        )}
        <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
      </button>
    </>
  );
}

export function MobileSiteNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <nav
      id="mobile-site-nav"
      aria-label="Main"
      className="border-b border-gold/10 bg-navy/95 px-3 py-3 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={isNavItemActive(pathname, item)}
            onClick={onClose}
            className="px-4 py-2.5"
          />
        ))}
      </div>
    </nav>
  );
}