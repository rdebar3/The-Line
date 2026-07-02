import { AdaptiveMissionExperience } from "@/components/adaptive/adaptive-mission-experience";
import { PageBackground } from "@/components/rights/page-background";

export default function AdaptiveMissionPage() {
  return (
    <PageBackground>
      <div className="page-shell max-w-4xl py-8 sm:py-12">
        <AdaptiveMissionExperience />
      </div>
    </PageBackground>
  );
}