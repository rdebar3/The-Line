import { MyLinesExperience } from "@/components/my-lines/my-lines-experience";
import { PageShell } from "@/components/layout/page-shell";
import { PageBackground } from "@/components/rights/page-background";

export const metadata = {
  title: "My Lines | The Line",
  description:
    "Your personal collection of constitutional passages and principles saved from founding documents and training.",
};

export default function MyLinesPage() {
  return (
    <PageBackground>
      <PageShell footerTagline="Hold the passages that hold the line.">
        <MyLinesExperience />
      </PageShell>
    </PageBackground>
  );
}