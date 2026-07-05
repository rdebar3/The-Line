"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { GUARDIAN_IMAGE, guardianLabels } from "@/lib/guardian";

type HeroPatriotProps = {
  reducedMotion?: boolean;
};

export function HeroPatriot({ reducedMotion = false }: HeroPatriotProps) {
  return (
    <div className="hub-hero-cinematic-patriot-wrap">
      <motion.div
        className="hub-hero-cinematic-patriot-aura"
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.7, scale: 1 }
            : { opacity: [0.55, 0.95, 0.6], scale: [1, 1.08, 1] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="hub-hero-cinematic-patriot-breathe"
        animate={reducedMotion ? undefined : { scale: [1, 1.025, 1] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="hub-hero-cinematic-patriot-cloak"
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: [0, 1.2, -0.8, 0.6, 0],
                  skewX: [0, 1.5, -1, 0.5, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Image
            src={GUARDIAN_IMAGE}
            alt={guardianLabels.neutral}
            width={480}
            height={704}
            priority
            className="hub-hero-cinematic-patriot-img"
            sizes="(max-width: 640px) 55vw, (max-width: 1024px) 42vw, 480px"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}