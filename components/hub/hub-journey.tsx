import Link from "next/link";
import { Map } from "lucide-react";

import { isLeaderboardConfigured } from "@/lib/leaderboard";

import { CertificationsHubCard } from "@/components/hub/certifications-hub-card";
import { MyLinesHubCard } from "@/components/hub/my-lines-hub-card";
import { QuickDrillsHubCard } from "@/components/hub/quick-drills-hub-card";
import { RepublicSimulatorHubCard } from "@/components/hub/republic-simulator-hub-card";
import { StartTrainingHubCard } from "@/components/hub/start-training-hub-card";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";

export function HubJourney() {
  const leaderboardConfigured = isLeaderboardConfigured();

  return (
    <section aria-label="Hub navigation" className="flex flex-col gap-6 sm:gap-8">
      <header className="command-module-header text-center">
        <p className="section-eyebrow">Tactical Systems</p>
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
        <p className="mb-3 px-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase sm:mb-4 sm:text-xs">
          Feature Modules
        </p>
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
        <p className="mb-3 px-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase sm:mb-4 sm:text-xs">
          Advanced Simulation
        </p>
        <RepublicSimulatorHubCard />
      </div>

      <div className="relative">
        <p className="mb-3 px-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase sm:mb-4 sm:text-xs">
          Defender Rankings
        </p>
        <LeaderboardPanel configured={leaderboardConfigured} />
      </div>
    </section>
  );
}