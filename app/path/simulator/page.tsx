import { RepublicSimulatorExperience } from "@/components/republic-simulator/republic-simulator-experience";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Republic Simulator Capstone | The Line",
  description:
    "The final training path challenge. After certifying all three founding documents, enter the First Congress for Grok-powered decision-making and Defender Score rewards.",
};

export default function PathSimulatorPage() {
  return (
    <PageShell footerTagline="Hold the republic. Hold the line.">
      <RepublicSimulatorExperience />
    </PageShell>
  );
}