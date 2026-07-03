"use client";

import Link from "next/link";
import { ArrowLeft, Award, Swords } from "lucide-react";

import { CertificationCard } from "@/components/certifications/certification-card";
import { useProgression } from "@/hooks/use-progression";
import { getAllCertificationProgress } from "@/lib/certifications";
import { CHARACTER_NAME } from "@/lib/guardian";

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
      <header className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back to Hub
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Defender Credentials</p>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Certifications
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Earn official credentials by mastering the founding documents.
              {CHARACTER_NAME} awards certificates for accuracy, training volume,
              and Defender Score milestones.
            </p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 text-center">
            <Award className="mx-auto size-6 text-gold" />
            <p className="mt-2 font-heading text-2xl font-bold text-gold">
              {earnedCount}/{progressList.length}
            </p>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Earned
            </p>
          </div>
        </div>
      </header>

      {earnedCount === 0 && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.06] px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-gold">Your path starts here.</span>{" "}
          Complete scenarios in Rights Under Pressure to build accuracy and
          Defender Score. Each certificate unlocks a shareable credential and a
          bonus score award.
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
        </ul>
        <Link
          href="/rights-under-pressure"
          className="btn-crimson mt-5 inline-flex items-center gap-2"
        >
          <Swords className="size-4" />
          Start training
        </Link>
      </div>
    </div>
  );
}