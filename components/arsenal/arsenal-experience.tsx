"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  Gavel,
  Scale,
} from "lucide-react";

import { WalletCardsPrint } from "@/components/arsenal/wallet-cards-print";
import { EducationalDisclaimer } from "@/components/legal/educational-disclaimer";
import { PaywallGate } from "@/components/monetization/paywall-gate";
import { FieldCardShare } from "@/components/share/field-card-share";
import {
  arsenalCategories,
  arsenalItems,
  type ArsenalItem,
} from "@/lib/arsenal";
import {
  ARSENAL_SITUATIONS,
  type ArsenalSituationId,
} from "@/lib/arsenal-situations";
import { ARSENAL_DISCLAIMER } from "@/lib/legal-disclaimers";
import { cn } from "@/lib/utils";

const categoryIcons = {
  script: Scale,
  case: Gavel,
  checklist: ClipboardList,
  principle: BookOpen,
} as const;

function ArsenalCard({ item }: { item: ArsenalItem }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcons[item.category];

  return (
    <button
      type="button"
      onClick={() => setExpanded((value) => !value)}
      className={cn(
        "w-full rounded-2xl border px-5 py-5 text-left transition-all sm:px-6 sm:py-6",
        expanded
          ? "border-gold/30 bg-gold/5"
          : "border-navy-border/80 bg-navy-elevated/50 hover:border-navy-border hover:bg-navy-elevated/80"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.amendment && (
              <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-0.5 font-heading text-[0.65rem] font-semibold tracking-wide text-gold uppercase">
                {item.amendment}
              </span>
            )}
            {item.situations?.map((situation) => {
              const meta = ARSENAL_SITUATIONS.find((s) => s.id === situation);
              return (
                <span
                  key={situation}
                  className="rounded-md border border-navy-border/60 bg-navy/50 px-2 py-0.5 text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {meta?.label ?? situation}
                </span>
              );
            })}
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
              {arsenalCategories.find((c) => c.id === item.category)?.label}
            </span>
          </div>
          <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
          {expanded && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-1 space-y-4 duration-200">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {item.content}
              </p>
              {item.category === "script" && (
                <FieldCardShare
                  title={item.title}
                  subtitle={item.amendment ?? "Defense Script"}
                  body={item.content.split("\n")[0] ?? item.summary}
                  className="print:hidden"
                />
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180 text-gold"
          )}
        />
      </div>
    </button>
  );
}

export function ArsenalExperience() {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [activeSituation, setActiveSituation] = useState<
    ArsenalSituationId | "all"
  >("all");

  const filtered = arsenalItems.filter((item) => {
    const categoryMatch =
      activeCategory === "all" || item.category === activeCategory;
    const situationMatch =
      activeSituation === "all" ||
      item.situations?.includes(activeSituation);
    return categoryMatch && situationMatch;
  });

  return (
    <PaywallGate
      feature="full_arsenal"
      title="Constitutional Arsenal"
      description="Unlock defense scripts, landmark cases, field checklists, and founding principles for real-world situations."
    >
      <div className="space-y-8">
        <header className="animate-fade-up text-center">
          <p className="section-eyebrow text-xs">Premium Resource</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Constitutional Arsenal
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Practical tools grounded in the Constitution and Bill of Rights —
            organized by the situations you might face tomorrow.
          </p>
        </header>

        <div>
          <p className="mb-2 text-center font-heading text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            By situation
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible">
            <button
              type="button"
              onClick={() => setActiveSituation("all")}
              className={cn(
                "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                activeSituation === "all"
                  ? "border-crimson/40 bg-crimson/10 text-crimson"
                  : "border-navy-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              All situations
            </button>
            {ARSENAL_SITUATIONS.map((situation) => (
              <button
                key={situation.id}
                type="button"
                onClick={() => setActiveSituation(situation.id)}
                className={cn(
                  "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  activeSituation === situation.id
                    ? "border-crimson/40 bg-crimson/10 text-crimson"
                    : "border-navy-border/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {situation.label}
              </button>
            ))}
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-navy-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {arsenalCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === category.id
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-navy-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-navy-border/60 bg-navy/40 px-4 py-8 text-center text-sm text-muted-foreground">
              No items match this filter — try another situation or category.
            </p>
          ) : (
            filtered.map((item) => <ArsenalCard key={item.id} item={item} />)
          )}
        </div>

        <section className="rounded-2xl border border-gold/20 bg-gold/5 p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Printable wallet cards
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Five rights and three lines to say — pocket-ready for premium defenders.
          </p>
          <div className="mt-4">
            <WalletCardsPrint />
          </div>
        </section>

        <EducationalDisclaimer />
        <p className="text-center text-xs text-muted-foreground">{ARSENAL_DISCLAIMER}</p>
      </div>
    </PaywallGate>
  );
}