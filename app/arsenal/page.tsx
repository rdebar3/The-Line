import { ArsenalExperience } from "@/components/arsenal/arsenal-experience";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Constitutional Arsenal | The Line",
  description:
    "Defense scripts, landmark cases, field checklists, and founding principles for defending your constitutional rights.",
};

export default function ArsenalPage() {
  return (
    <PageShell
      footerTagline="Armed with principle. Hold the line."
      maxWidth="6xl"
    >
      <ArsenalExperience />
    </PageShell>
  );
}