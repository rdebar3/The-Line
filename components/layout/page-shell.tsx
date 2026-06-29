import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  footerTagline?: string;
  showBack?: boolean;
  animate?: boolean;
  maxWidth?: "4xl" | "6xl";
  compactFooter?: boolean;
};

export function PageShell({
  children,
  footerTagline,
  showBack = true,
  animate = true,
  maxWidth = "6xl",
  compactFooter = true,
}: PageShellProps) {
  return (
    <PageBackground>
      <div
        className={cn(
          "page-shell",
          maxWidth === "4xl" ? "max-w-4xl" : "max-w-6xl"
        )}
      >
        {showBack && (
          <nav className={cn("mb-8", animate && "animate-fade-up")}>
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              variant="ghost"
              className="gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-gold"
            >
              <ArrowLeft className="size-4" />
              Back to The Line
            </Button>
          </nav>
        )}

        <div className={cn(animate && "animate-fade-up-delay-1")}>{children}</div>

        <SiteFooter tagline={footerTagline} compact={compactFooter} />
      </div>
    </PageBackground>
  );
}