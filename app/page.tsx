import { FileText, Landmark, ScrollText } from "lucide-react";

import { CHARACTER_NAME } from "@/lib/guardian";
import { isLeaderboardConfigured } from "@/lib/leaderboard";

import { ArsenalCard } from "@/components/hub/arsenal-card";
import { HubHero } from "@/components/hub/hub-hero";
import { DefenderProgressionHub } from "@/components/hub/defender-progression-hub";
import { IntelligenceReportPanel } from "@/components/hub/intelligence-report-panel";
import { DocumentCard } from "@/components/hub/document-card";
import { GuardianPlaceholder } from "@/components/hub/guardian-placeholder";
import { HubJourney } from "@/components/hub/hub-journey";
import { MyLinesHubCard } from "@/components/hub/my-lines-hub-card";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";
import { HubMonetizationFooter } from "@/components/hub/hub-monetization-footer";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

const documents = [
  {
    title: "Declaration of Independence",
    description: "Natural rights and the case for self-government.",
    href: "/declaration",
    icon: ScrollText,
    accent: "gold" as const,
  },
  {
    title: "The Constitution",
    description: "Limited government, separated powers, ordered liberty.",
    href: "/constitution",
    icon: Landmark,
    accent: "blue" as const,
  },
  {
    title: "Bill of Rights",
    description: "Ten amendments limiting federal power.",
    href: "/bill-of-rights",
    icon: FileText,
    accent: "crimson" as const,
  },
];

export default function Home() {
  const leaderboardConfigured = isLeaderboardConfigured();

  return (
    <PageBackground>
      <div className="page-shell max-w-6xl pb-2">
        {/* Hero: single primary CTA for new users (see hub-hero.tsx) */}
        <HubHero />

        <div className="hub-section-tight animate-fade-up-delay-1 opacity-95">
          <HubJourney />
        </div>

        <section id="progression" className="hub-section animate-fade-up-delay-2">
          <DefenderProgressionHub />
        </section>

        <section id="intelligence" className="hub-section animate-fade-up-delay-2">
          <IntelligenceReportPanel />
        </section>

        <div className="hub-section">
          <LeaderboardPanel configured={leaderboardConfigured} />
        </div>

        <section id="documents" className="hub-section animate-fade-up-delay-3">
          <header className="hub-section-header">
            <h2 className="section-eyebrow">Founding Documents</h2>
            <p className="hub-section-subtitle">
              Study the text that limits power and secures liberty.
            </p>
          </header>

          <div className="mb-5 sm:mb-6">
            <MyLinesHubCard />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc.href} {...doc} />
            ))}
            <div className="sm:col-span-2 xl:col-span-1">
              <ArsenalCard />
            </div>
          </div>
        </section>

        <section id="counsel" className="hub-section animate-fade-up-delay-3">
          <header className="hub-section-header">
            <h2 className="section-eyebrow">Constitutional Counsel</h2>
            <p className="hub-section-subtitle">
              Ask {CHARACTER_NAME} about rights, documents, and training.
            </p>
          </header>
          <GuardianPlaceholder />
        </section>

        <HubMonetizationFooter className="hub-section" />

        <SiteFooter variant="hub" />
      </div>
    </PageBackground>
  );
}