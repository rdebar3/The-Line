"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

import { GUARDIAN_IMAGE, guardianLabels } from "@/lib/guardian";

const ease = [0.22, 1, 0.36, 1] as const;

type HeroPatriotProps = {
  reducedMotion?: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
};

export function HeroPatriot({
  reducedMotion = false,
  containerRef,
}: HeroPatriotProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const patriotY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const patriotScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <motion.div
      className="hub-hero-v3-patriot-wrap"
      style={{
        y: reducedMotion ? 0 : patriotY,
        scale: reducedMotion ? 1 : patriotScale,
      }}
      initial={reducedMotion ? false : { opacity: 0, x: -48, scale: 0.88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.1, ease, delay: 0.15 }}
    >
      <motion.div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--crimson"
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.5, scale: 1 }
            : { opacity: [0.35, 0.75, 0.4], scale: [1, 1.15, 1] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--gold"
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.65, scale: 1 }
            : { opacity: [0.5, 1, 0.55], scale: [1, 1.1, 1] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }
      />
      <motion.div
        className="hub-hero-v3-patriot-aura hub-hero-v3-patriot-aura--core"
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.8, scale: 1 }
            : { opacity: [0.65, 1, 0.7], scale: [1, 1.06, 1] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className="hub-hero-v3-patriot-rim" aria-hidden />
      <div className="hub-hero-v3-patriot-floor-glow" aria-hidden />

      <motion.div
        className="hub-hero-v3-patriot-breathe"
        animate={reducedMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="hub-hero-v3-patriot-cloak"
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: [0, 2.5, -1.8, 1.2, 0],
                  skewX: [0, 2.5, -1.5, 1, 0],
                  rotateY: [0, 3, -2, 1.5, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Image
            src={GUARDIAN_IMAGE}
            alt={guardianLabels.neutral}
            width={560}
            height={820}
            priority
            className="hub-hero-v3-patriot-img"
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 560px"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}