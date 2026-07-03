import { CertificationsExperience } from "@/components/certifications/certifications-experience";
import { PageShell } from "@/components/layout/page-shell";
import { PageBackground } from "@/components/rights/page-background";

export const metadata = {
  title: "Certifications | The Line",
  description:
    "Earn Defender of the Declaration, Guardian of the Constitution, and Sentinel of the Bill of Rights credentials.",
};

export default function CertificationsPage() {
  return (
    <PageBackground>
      <PageShell footerTagline="Hold the line. Earn the credential.">
        <CertificationsExperience />
      </PageShell>
    </PageBackground>
  );
}