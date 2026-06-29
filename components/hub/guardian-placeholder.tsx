"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { CHARACTER_NAME } from "@/lib/guardian";
import { GuardianChat } from "@/components/hub/guardian-chat";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

type Tab = "guide" | "grok";

const QUICK_LINKS = [
  { href: "/declaration", label: "Declaration" },
  { href: "/constitution", label: "Constitution" },
  { href: "/bill-of-rights", label: "Bill of Rights" },
  { href: "/rights-under-pressure", label: "Training" },
];

const PREMIUM_QUICK_LINKS = [
  ...QUICK_LINKS,
  { href: "/arsenal", label: "Arsenal" },
];

export function GuardianPlaceholder() {
  const [activeTab, setActiveTab] = useState<Tab>("guide");
  const { isPremium, isLoading } = useSubscription();
  const showLocked = !isLoading && !isPremium;

  useEffect(() => {
    if (!isLoading && isPremium) {
      setActiveTab("grok");
    }
  }, [isLoading, isPremium]);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="hub-card-shell">
        <div aria-hidden className="hub-card-accent" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="relative flex w-full rounded-xl border border-navy-border/70 bg-navy/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={cn(
              "relative z-10 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              activeTab === "guide"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quick Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("grok")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              activeTab === "grok"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="size-3.5 text-gold" />
            Ask {CHARACTER_NAME}
            {showLocked && (
              <span className="rounded border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-wide text-gold uppercase">
                Preview
              </span>
            )}
          </button>
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-navy-elevated shadow-sm transition-transform duration-200 ease-out",
              activeTab === "grok" ? "translate-x-[calc(100%+4px)]" : "translate-x-1"
            )}
          />
          </div>

          <div className="mt-5 w-full transition-opacity duration-200">
            {activeTab === "guide" ? (
              <div className="flex flex-wrap justify-center gap-2">
                {(isPremium ? PREMIUM_QUICK_LINKS : QUICK_LINKS).map((link) => (
                  <Button
                    key={link.href}
                    nativeButton={false}
                    render={<Link href={link.href} />}
                    variant="outline"
                    size="sm"
                    className="min-h-10 rounded-xl border-navy-border/80 text-muted-foreground hover:border-gold/30 hover:text-foreground"
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            ) : (
              <GuardianChat />
            )}
          </div>

          {showLocked && activeTab === "grok" && (
            <p className="mt-4 text-center text-xs text-muted-foreground/80">
              Free: 3 questions/day · Unlock for unlimited counsel
            </p>
          )}
        </div>
      </div>
    </div>
  );
}