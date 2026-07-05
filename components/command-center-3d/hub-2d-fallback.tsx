import { FoundingDocumentsHighlight } from "@/components/hub/founding-documents-highlight";
import { HubHero } from "@/components/hub/hub-hero";
import { HubJourney } from "@/components/hub/hub-journey";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

/** Classic 2D hub — used when prefers-reduced-motion is enabled. */
export function Hub2DFallback() {
  return (
    <PageBackground>
      <div className="command-dashboard page-shell max-w-6xl pb-2">
        <section className="command-focus-zone animate-fade-up">
          <HubHero />
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