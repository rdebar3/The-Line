import { RepublicSimulatorExperience } from "@/components/republic-simulator/republic-simulator-experience";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Republic Simulator | The Line",
  description:
    "Interactive Founding-era decision-making. Play the National Bank Debate as Madison with Grok counsel, historical reality, and Defender Score rewards.",
};

export default function RepublicSimulatorPage() {
  return (
    <PageShell footerTagline="Hold the republic. Hold the line.">
      <RepublicSimulatorExperience />
    </PageShell>
  );
}