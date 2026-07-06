import { HistoryArchiveExperience } from "@/components/history/history-archive-experience";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackground } from "@/components/rights/page-background";

export const metadata = {
  title: "History Archive | The Line",
  description:
    "Browse every daily 'This Day 250 Years Ago' briefing — sourced Revolutionary-era history debriefed by No Face Patriot.",
};

export default function HistoryArchivePage() {
  return (
    <PageBackground>
      <HistoryArchiveExperience />
      <div className="page-shell max-w-4xl pb-8">
        <SiteFooter variant="hub" />
      </div>
    </PageBackground>
  );
}