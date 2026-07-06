import { FoundingDocumentsHighlight } from "@/components/hub/founding-documents-highlight";
import { HubHero } from "@/components/hub/hub-hero";
import { HubJourney } from "@/components/hub/hub-journey";
import { TodayInHistoryCard } from "@/components/hub/today-in-history-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

export default function Home() {
  return (
    <PageBackground>
      <HubHero />

      <div className="command-dashboard page-shell max-w-6xl pb-2">
        <section className="command-panel-zone mt-8 animate-fade-up-delay-1 sm:mt-10">
          <TodayInHistoryCard />
        </section>

        <section className="command-panel-zone mt-8 animate-fade-up-delay-1 sm:mt-10">
          <FoundingDocumentsHighlight />
        </section>

        <section className="command-tactical-grid hub-section-tight animate-fade-up-delay-2">
          <HubJourney />
        </section>

        <SiteFooter variant="hub" />
      </div>
    </PageBackground>
  );
}