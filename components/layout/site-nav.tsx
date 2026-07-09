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
        "museum-nav-link",
        active && "is-active",
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
      <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
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
        className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(197,164,110,0.18)] bg-[rgba(15,29,51,0.5)] text-[rgba(245,241,233,0.7)] transition-colors hover:border-[rgba(197,164,110,0.35)] hover:text-[#F5F1E9] lg:hidden"
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
      className="border-b border-[rgba(197,164,110,0.12)] bg-[rgba(10,22,40,0.96)] px-4 py-4 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={isNavItemActive(pathname, item)}
            onClick={onClose}
            className="rounded-lg px-4 py-3 text-sm after:hidden"
          />
        ))}
      </div>
    </nav>
  );
}
