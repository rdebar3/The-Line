import { HubHero } from "@/components/hub/hub-hero";
import { HubJourney } from "@/components/hub/hub-journey";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

export default function Home() {
  return (
    <PageBackground>
      <div className="page-shell max-w-5xl pb-2">
        <HubHero />

        <div className="hub-section-tight animate-fade-up-delay-1">
          <HubJourney />
        </div>

        <SiteFooter variant="hub" />
      </div>
    </PageBackground>
  );
}