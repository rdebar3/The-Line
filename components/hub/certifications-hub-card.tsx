"use client";

import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

import { useProgression } from "@/hooks/use-progression";
import { getAllCertificationProgress } from "@/lib/certifications";

export function CertificationsHubCard() {
  const { state, isLoaded } = useProgression();

  const earnedCount = isLoaded && state
    ? getAllCertificationProgress(state).filter((item) => item.earned).length
    : 0;
  const totalCount = 4;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <Link href="/certifications" className="hub-tactical-card group">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-gold/35 bg-gold/15">
            <Award className="size-5 text-gold" />
          </span>
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
          Certifications
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          Earn prestigious credentials for mastering the Declaration,
          Constitution, and Bill of Rights.
        </p>
        <p className="mt-4 text-sm font-semibold text-gold">
          {isLoaded ? (
            earnedCount > 0 ? (
              <>
                {earnedCount} of {totalCount} earned
              </>
            ) : (
              "Begin your certification path"
            )
          ) : (
            "Loading…"
          )}
        </p>
      </Link>
    </motion.div>
  );
}