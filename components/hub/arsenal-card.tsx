"use client";

import Link from "next/link";
import { Lock, Shield, Swords } from "lucide-react";

import { useSubscription } from "@/hooks/use-subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ArsenalCard() {
  const { isPremium, isLoading, openUnlockModal } = useSubscription();
  const showLocked = !isLoading && !isPremium;

  const card = (
    <Card
      className={cn(
        "premium-card relative h-full min-h-[220px] overflow-hidden rounded-2xl py-0 transition-all hover:-translate-y-1.5",
        isPremium
          ? "hover:border-gold/45 hover:bg-navy-elevated/90 hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]"
          : "border-gold/15 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(201,162,39,0.08)]"
      )}
    >
      {showLocked && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-gold/30 bg-navy/80 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-gold uppercase backdrop-blur-sm">
          <Lock className="size-3" />
          Premium
        </div>
      )}

      <CardHeader className="gap-4 pb-2">
        <div className="flex size-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold shadow-[0_0_20px_rgba(201,162,39,0.1)] transition-transform duration-300 group-hover:scale-105">
          <Swords className="size-6" strokeWidth={1.5} />
        </div>
        <CardTitle className="font-heading text-xl font-semibold tracking-wide text-foreground">
          Constitutional Arsenal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6 pb-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Defense scripts, landmark cases, field checklists, and founding
          principles for when rights are tested in the real world.
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-all group-hover:text-gold/90">
          {isPremium ? (
            <>
              <Shield className="size-4" />
              Enter Arsenal
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Unlock to Access
            </>
          )}
        </span>
      </CardContent>
    </Card>
  );

  if (isPremium) {
    return (
      <Link href="/arsenal" className="group block h-full">
        {card}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openUnlockModal}
      className="group block h-full w-full text-left"
    >
      {card}
    </button>
  );
}