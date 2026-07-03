"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Bookmark, ScrollText } from "lucide-react";

import { SavedLineCard } from "@/components/my-lines/saved-line-card";
import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import {
  SCRIBE_OF_LIBERTY_THRESHOLD,
} from "@/lib/saved-lines";

export function MyLinesExperience() {
  const { lines, count, isLoaded } = useSavedLines();

  if (!isLoaded) {
    return (
      <div className="animate-pulse rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-12 text-center">
        <p className="text-sm text-muted-foreground">Loading your Lines…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="premium-card relative overflow-hidden rounded-2xl border border-gold/20 bg-navy-elevated/60 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.1)_0%,transparent_55%)]"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <GuardianCharacter mood="neutral" size="lg" floating showLabel />
            <div>
              <p className="font-heading text-[0.65rem] font-semibold tracking-[0.28em] text-gold uppercase">
                Personal Collection
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Lines
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Passages and principles you&apos;ve claimed from the founding
                documents and constitutional training — yours to revisit and
                share.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gold/25 bg-gold/10 px-5 py-4 text-center sm:min-w-[9rem]">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
              Saved
            </p>
            <p className="font-heading text-4xl font-bold text-foreground">
              {count}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {count >= SCRIBE_OF_LIBERTY_THRESHOLD
                ? "Scribe of Liberty earned"
                : `${SCRIBE_OF_LIBERTY_THRESHOLD - count} to Scribe badge`}
            </p>
          </div>
        </div>
      </header>

      {lines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-navy-border/80 bg-navy-elevated/30 px-6 py-12 text-center sm:py-16"
        >
          <Bookmark className="mx-auto size-10 text-gold/50" />
          <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
            No Lines saved yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Open the Declaration, Constitution, or Bill of Rights and tap{" "}
            <strong className="text-foreground">Save to My Lines</strong> on any
            passage. After training, save the principle that mattered most.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/declaration" />}
              className="btn-gold"
            >
              <ScrollText className="size-4" />
              Study founding documents
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/rights-under-pressure" />}
              variant="outline"
              className="border-crimson/30 text-crimson"
            >
              Enter training
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lines.map((line, index) => (
            <SavedLineCard key={line.id} line={line} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}