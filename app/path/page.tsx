import { Suspense } from "react";

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
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-navy-border/30" />}>
        <PathExperience />
      </Suspense>
    </PageShell>
  );
}