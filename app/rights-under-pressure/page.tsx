import { PageShell } from "@/components/layout/page-shell";
import { ScenarioExperience } from "@/components/rights/scenario-experience";

export const metadata = {
  title: "Rights Under Pressure | The Line",
  description:
    "Grok-powered constitutional training scaled to your Defender rank. Fresh scenarios, progressive difficulty, and No Face Patriot field debriefs.",
};

export default function RightsUnderPressurePage() {
  return (
    <PageShell footerTagline="Know the standard. Hold the line.">
      <ScenarioExperience />
    </PageShell>
  );
}