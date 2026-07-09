import { Award, BookOpen, Swords, Target, Zap } from "lucide-react";

import { GrokProgressionPanel } from "@/components/progression/grok-progression-panel";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Quick Drills | The Line",
  description:
    "Short tactical constitutional drills issued by No Face Patriot — general missions and weak-area remedial training.",
};

const STEP_CRUMBS = [
  { label: "Read", icon: BookOpen, active: false },
  { label: "Drill", icon: Target, active: true },
  { label: "Scenario", icon: Swords, active: false },
  { label: "Certify", icon: Award, active: false },
] as const;

export default function PathDrillPage() {
  return (
    <PageShell footerTagline="Drill hard. Hold the line.">
      <PageHeader
        className="mb-8 sm:mb-10"
        eyebrow="Tactical Training"
        title="Quick Drills"
        description="Short constitutional missions to sharpen judgment between full training sessions."
        aside={
          <div className="flex items-center gap-2 rounded-2xl border border-crimson/25 bg-crimson/5 px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-crimson/30 bg-crimson/12">
              <Zap className="size-4 text-crimson-light" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Path step
              </p>
              <p className="font-heading text-sm font-semibold text-foreground">
                Drill
              </p>
            </div>
          </div>
        }
      />

      <nav
        aria-label="Training step context"
        className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10"
      >
        {STEP_CRUMBS.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold tracking-wide",
                step.active
                  ? "border-crimson/40 bg-crimson/12 text-crimson-light"
                  : "border-navy-border/55 bg-navy/30 text-muted-foreground",
              ].join(" ")}
            >
              <step.icon className="size-3" strokeWidth={1.75} />
              {step.label}
            </span>
            {index < STEP_CRUMBS.length - 1 && (
              <span
                aria-hidden
                className="hidden h-px w-4 bg-navy-border/50 sm:block"
              />
            )}
          </div>
        ))}
      </nav>

      <GrokProgressionPanel />
    </PageShell>
  );
}
