"use client";

import Link from "next/link";
import { Award, Bookmark, Swords } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CertificationCard } from "@/components/certifications/certification-card";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { getAllCertificationProgress } from "@/lib/certifications";
import { CHARACTER_NAME } from "@/lib/guardian";
import {
  SCRIBE_OF_LIBERTY_BONUS,
  SCRIBE_OF_LIBERTY_THRESHOLD,
} from "@/lib/saved-lines";

export function CertificationsExperience() {
  const { state, isLoaded, rank } = useProgression();

  if (!isLoaded || !state) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-navy-border/40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-2xl border border-navy-border/40 bg-navy-elevated/40"
            />
          ))}
        </div>
      </div>
    );
  }

  const progressList = getAllCertificationProgress(state);
  const earnedCount = progressList.filter((item) => item.earned).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Defender Credentials"
        title="Certifications"
        description={`Earn official credentials by mastering the founding documents. ${CHARACTER_NAME} awards certificates for accuracy, training volume, and Defender Score milestones.`}
        aside={
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-5 py-4 text-center">
            <Award className="mx-auto size-6 text-gold" />
            <p className="mt-2 font-heading text-2xl font-bold text-gold">
              {earnedCount}/{progressList.length}
            </p>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Earned
            </p>
          </div>
        }
      />

      {earnedCount === 0 && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.06] px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-gold">Your path starts here.</span>{" "}
          Complete scenarios in Rights Under Pressure and Quick Drills to build
          accuracy and Defender Score. Save passages in{" "}
          <Link href="/my-lines" className="font-semibold text-foreground hover:text-gold">
            My Lines
          </Link>{" "}
          — at {SCRIBE_OF_LIBERTY_THRESHOLD} saves you earn the Scribe of Liberty
          badge (+{SCRIBE_OF_LIBERTY_BONUS} Defender Score) toward certification
          thresholds.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {progressList.map((item, index) => (
          <CertificationCard
            key={item.definition.id}
            progress={item}
            rankTitle={rank.title}
            index={index}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-5 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-foreground">
          How to earn certificates
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">Train:</span> Complete
            scenarios in Rights Under Pressure for each founding document.
          </li>
          <li>
            <span className="font-semibold text-foreground">Accuracy:</span>{" "}
            Maintain 80%+ accuracy in that document&apos;s topics (75%+ overall
            for Full Constitutional Defender).
          </li>
          <li>
            <span className="font-semibold text-foreground">Defender Score:</span>{" "}
            Reach the minimum score threshold for each certificate tier.
          </li>
          <li>
            <span className="font-semibold text-foreground">Full Defender:</span>{" "}
            Earn all three document certificates, then hit 3,000 Defender Score
            with strong overall accuracy.
          </li>
          <li>
            <span className="font-semibold text-foreground">Study & save:</span>{" "}
            Save founding passages in My Lines to earn the Scribe of Liberty badge
            — a {SCRIBE_OF_LIBERTY_BONUS}-point boost toward Defender Score goals.
          </li>
        </ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/rights-under-pressure" />}
            className="btn-crimson btn-cta h-11 rounded-xl"
          >
            <Swords className="size-4" />
            Start training
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/my-lines" />}
            variant="outline"
            className="btn-cta h-11 rounded-xl border-gold/30 text-gold hover:bg-gold/10"
          >
            <Bookmark className="size-4" />
            Open My Lines
          </Button>
        </div>
      </div>
    </div>
  );
}