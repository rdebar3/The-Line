import { GrokProgressionPanel } from "@/components/progression/grok-progression-panel";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Quick Drills | The Line",
  description:
    "Short tactical constitutional drills issued by No Face Patriot — general missions and weak-area remedial training.",
};

export default function QuickDrillsPage() {
  return (
    <PageShell footerTagline="Drill hard. Hold the line.">
      <PageHeader
        className="mb-8 sm:mb-10"
        eyebrow="Tactical Training"
        title="Quick Drills"
        description="Short missions to sharpen judgment between full training sessions."
      />
      <GrokProgressionPanel />
    </PageShell>
  );
}