import { PathExperience } from "@/components/path/path-experience";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Training Path | The Line",
  description:
    "Your sequential journey through the Declaration of Independence, U.S. Constitution, and Bill of Rights.",
};

export default function PathPage() {
  return (
    <PageShell footerTagline="Read. Drill. Scenario. Certify. Hold the line.">
      <PathExperience />
    </PageShell>
  );
}