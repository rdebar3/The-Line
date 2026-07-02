"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FreeVsPremium } from "@/components/monetization/free-vs-premium";
import { PremiumAccessBanner } from "@/components/monetization/premium-access-banner";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

type HubMonetizationFooterProps = {
  className?: string;
};

export function HubMonetizationFooter({ className }: HubMonetizationFooterProps) {
  const { isPremium, isLoading } = useSubscription();

  return (
    <section id="upgrade" className={cn("scroll-mt-24", className)}>
      {!isLoading && !isPremium && <FreeVsPremium variant="hub" showCta />}

      {!isLoading && isPremium && (
        <div className="hub-card-shell text-center">
          <div aria-hidden className="hub-card-accent" />
          <div className="relative flex flex-col items-center px-6 py-8 sm:px-8 sm:py-10">
            <PremiumAccessBanner className="w-full max-w-lg border-0 bg-transparent p-0" />
            <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Button
                nativeButton={false}
                render={<Link href="/arsenal" />}
                variant="outline"
                className="btn-cta h-12 rounded-xl border-gold/30 bg-navy-elevated/60 text-gold hover:border-gold/50 hover:bg-gold/10"
              >
                Constitutional Arsenal
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/rights-under-pressure" />}
                className="btn-crimson btn-cta h-12 rounded-xl"
              >
                Enter Training
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}