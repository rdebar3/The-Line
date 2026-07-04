import { GrokProgressionPanel } from "@/components/progression/grok-progression-panel";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Quick Drills | The Line",
  description:
    "Short tactical constitutional drills issued by No Face Patriot — general missions and weak-area remedial training.",
};

export default function QuickDrillsPage() {
  return (
    <PageShell footerTagline="Drill hard. Hold the line.">
      <header className="mb-8 text-center sm:mb-10">
        <p className="section-eyebrow">Tactical Training</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
          Quick Drills
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Short missions to sharpen judgment between full training sessions.
        </p>
      </header>
      <GrokProgressionPanel />
    </PageShell>
  );
}