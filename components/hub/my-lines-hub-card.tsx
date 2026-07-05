"use client";

import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import { SCRIBE_OF_LIBERTY_THRESHOLD } from "@/lib/saved-lines";

export function MyLinesHubCard() {
  const { count, isLoaded } = useSavedLines();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href="/my-lines" className="hub-tactical-card group">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-gold/35 bg-gold/15">
            <Bookmark className="size-5 text-gold" />
          </span>
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
          My Lines
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          Your personal collection of constitutional passages and training
          principles.
        </p>
        <p className="mt-4 text-sm font-semibold text-gold">
          {isLoaded ? (
            <>
              {count} saved
              {count < SCRIBE_OF_LIBERTY_THRESHOLD && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {SCRIBE_OF_LIBERTY_THRESHOLD - count} to Scribe of Liberty
                </span>
              )}
            </>
          ) : (
            "Loading…"
          )}
        </p>
      </Link>
    </motion.div>
  );
}