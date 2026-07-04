import { isLeaderboardConfigured } from "@/lib/leaderboard";

import { CertificationsHubCard } from "@/components/hub/certifications-hub-card";
import { MyLinesHubCard } from "@/components/hub/my-lines-hub-card";
import { QuickDrillsHubCard } from "@/components/hub/quick-drills-hub-card";
import { StartTrainingHubCard } from "@/components/hub/start-training-hub-card";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";

export function HubJourney() {
  const leaderboardConfigured = isLeaderboardConfigured();

  return (
    <section aria-label="Hub navigation" className="flex flex-col gap-6 sm:gap-8">
      <header className="text-center">
        <p className="section-eyebrow">Defender Toolkit</p>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          Train, save, certify, and rank up — every feature builds your Defender
          Score.
        </p>
      </header>

      <StartTrainingHubCard />

      <nav aria-label="Hub features">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
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

      <LeaderboardPanel configured={leaderboardConfigured} />
    </section>
  );
}