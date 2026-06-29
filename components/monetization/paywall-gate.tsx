"use client";

import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { UNLOCK_CTA_LABEL, type PremiumFeature } from "@/lib/subscription";
import { cn } from "@/lib/utils";

type PaywallGateProps = {
  feature: PremiumFeature;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export function PaywallGate({
  feature,
  children,
  title = "Premium Feature",
  description = "Unlock the full experience to access this feature.",
  className,
}: PaywallGateProps) {
  const { canAccess, openUnlockModal, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-8",
          className
        )}
      >
        <div className="mx-auto h-6 w-40 rounded bg-navy-border/40" />
        <div className="mx-auto mt-4 h-4 w-64 max-w-full rounded bg-navy-border/30" />
        <div className="mx-auto mt-8 h-32 w-full max-w-md rounded-xl bg-navy-border/20" />
      </div>
    );
  }

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "flex min-h-[320px] items-center justify-center rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-6",
        className
      )}
    >
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
          <Lock className="size-5 text-gold" />
        </div>
        <h3 className="font-heading text-lg font-semibold tracking-wide text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Button onClick={openUnlockModal} className="btn-gold mt-5 w-full">
          {UNLOCK_CTA_LABEL}
        </Button>
      </div>
    </div>
  );
}