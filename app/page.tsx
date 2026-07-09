import { FoundingDocumentsHighlight } from "@/components/hub/founding-documents-highlight";
import { HubHero } from "@/components/hub/hub-hero";
import { HubJourney } from "@/components/hub/hub-journey";
import { TodayInHistoryCard } from "@/components/hub/today-in-history-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

/**
 * Homepage — museum-quality civic entrance.
 *
 * Structure:
 *  1. Full-viewport hero (Know the standard. Hold the line.)
 *  2. Today in History
 *  3. Founding Documents grid
 *  4. Training journey modules
 *  5. Footer
 *
 * Navbar (logo, primary nav, Defender Score) lives in root layout AuthHeader.
 * Design tokens: app/museum.css (deep navy, antique gold, cream, parchment).
 */
export default function Home() {
  return (
    <PageBackground>
      <HubHero />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 md:px-10">
        <section className="mt-6 sm:mt-10">
          <TodayInHistoryCard />
        </section>

        <section className="mt-16 sm:mt-20 lg:mt-24">
          <FoundingDocumentsHighlight />
        </section>

        <section className="mt-16 sm:mt-20 lg:mt-24">
          <HubJourney />
        </section>

        <SiteFooter variant="hub" tagline="Know the standard. Hold the line." />
      </div>
    </PageBackground>
  );
}
