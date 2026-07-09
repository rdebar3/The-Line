import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { Landmark, Map, Trophy, Zap } from "lucide-react";

import { isLeaderboardConfigured } from "@/lib/leaderboard";

import { CertificationsHubCard } from "@/components/hub/certifications-hub-card";
import { MyLinesHubCard } from "@/components/hub/my-lines-hub-card";
import { QuickDrillsHubCard } from "@/components/hub/quick-drills-hub-card";
import { RepublicSimulatorHubCard } from "@/components/hub/republic-simulator-hub-card";
import { StartTrainingHubCard } from "@/components/hub/start-training-hub-card";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";

function ModuleSectionLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <p className="mb-3 flex items-center gap-2 px-0.5 sm:mb-4">
      <span className="flex size-6 items-center justify-center rounded-md border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)]">
        <Icon className="size-3 text-[#C5A46E]" strokeWidth={1.75} />
      </span>
      <span className="font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase sm:text-xs">
        {children}
      </span>
    </p>
  );
}

export function HubJourney() {
  const leaderboardConfigured = isLeaderboardConfigured();

  return (
    <section aria-label="Hub navigation" className="flex flex-col gap-6 sm:gap-8">
      <header className="command-module-header text-center">
        <p className="section-eyebrow inline-flex items-center justify-center gap-2">
          <Map className="size-3.5 opacity-80" strokeWidth={1.75} />
          Tactical Systems
        </p>
        <p className="hub-section-subtitle">
          Train, save, certify, and rank up — every module feeds your Defender
          Score.
        </p>
        <p className="mt-3">
          <Link
            href="/path"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-gold"
          >
            <Map className="size-3.5" />
            Preview training path
          </Link>
        </p>
      </header>

      <StartTrainingHubCard />

      <nav aria-label="Hub features" className="relative">
        <ModuleSectionLabel icon={Zap}>Feature Modules</ModuleSectionLabel>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <li className="min-w-0">
            <MyLinesHubCard />
          </li>
          <li className="min-w-0">
            <CertificationsHubCard />
          </li>
          <li className="min-w-0">
            <QuickDrillsHubCard />
          </li>
        </ol>
      </nav>

      <div className="relative">
        <ModuleSectionLabel icon={Landmark}>Path Capstone</ModuleSectionLabel>
        <RepublicSimulatorHubCard />
      </div>

      <div className="relative">
        <ModuleSectionLabel icon={Trophy}>Defender Rankings</ModuleSectionLabel>
        <LeaderboardPanel configured={leaderboardConfigured} />
      </div>
    </section>
  );
}
