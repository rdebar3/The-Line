"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useCallback, useRef } from "react";

type Particle = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  tone: "gold" | "crimson" | "white";
};

const PARTICLES: Particle[] = [
  { left: "4%", top: "12%", size: 4, duration: 6.8, delay: 0, tone: "gold" },
  { left: "11%", top: "68%", size: 3, duration: 8.2, delay: 0.8, tone: "crimson" },
  { left: "18%", top: "38%", size: 5, duration: 7.4, delay: 1.4, tone: "gold" },
  { left: "26%", top: "82%", size: 2, duration: 9.6, delay: 0.3, tone: "white" },
  { left: "32%", top: "22%", size: 3, duration: 8.8, delay: 2.1, tone: "gold" },
  { left: "39%", top: "55%", size: 4, duration: 7.1, delay: 1.7, tone: "crimson" },
  { left: "45%", top: "14%", size: 2, duration: 10.2, delay: 0.5, tone: "gold" },
  { left: "52%", top: "72%", size: 5, duration: 8.5, delay: 2.6, tone: "gold" },
  { left: "58%", top: "32%", size: 3, duration: 9.1, delay: 1.1, tone: "white" },
  { left: "64%", top: "88%", size: 2, duration: 7.8, delay: 3.2, tone: "crimson" },
  { left: "71%", top: "18%", size: 4, duration: 8.4, delay: 0.9, tone: "gold" },
  { left: "77%", top: "48%", size: 3, duration: 10.5, delay: 2.3, tone: "gold" },
  { left: "83%", top: "76%", size: 2, duration: 7.3, delay: 1.9, tone: "crimson" },
  { left: "89%", top: "28%", size: 5, duration: 9.4, delay: 0.6, tone: "gold" },
  { left: "94%", top: "58%", size: 3, duration: 8.7, delay: 2.8, tone: "white" },
  { left: "7%", top: "44%", size: 2, duration: 11, delay: 3.5, tone: "gold" },
  { left: "22%", top: "8%", size: 3, duration: 8.9, delay: 1.3, tone: "crimson" },
  { left: "48%", top: "92%", size: 4, duration: 7.6, delay: 2, tone: "gold" },
  { left: "61%", top: "6%", size: 2, duration: 9.8, delay: 0.2, tone: "white" },
  { left: "36%", top: "64%", size: 3, duration: 8.3, delay: 2.5, tone: "gold" },
  { left: "74%", top: "92%", size: 4, duration: 7.9, delay: 1.6, tone: "crimson" },
  { left: "15%", top: "92%", size: 2, duration: 10.1, delay: 3.8, tone: "gold" },
  { left: "92%", top: "8%", size: 3, duration: 8.6, delay: 1, tone: "gold" },
  { left: "55%", top: "42%", size: 2, duration: 9.3, delay: 2.2, tone: "crimson" },
];

const particleToneClass: Record<Particle["tone"], string> = {
  gold: "hub-hero-v3-particle--gold",
  crimson: "hub-hero-v3-particle--crimson",
  white: "hub-hero-v3-particle--white",
};

type HeroBackgroundProps = {
  reducedMotion?: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
};

export function HeroBackground({
  reducedMotion = false,
  containerRef,
}: HeroBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const raysRotate = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const flagX = useTransform(mouseX, [-0.5, 0.5], reducedMotion ? [0, 0] : [-28, 28]);
  const flagY = useTransform(mouseY, [-0.5, 0.5], reducedMotion ? [0, 0] : [-16, 16]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reducedMotion]
  );

  return (
    <motion.div
      ref={bgRef}
      className="hub-hero-v3-bg"
      style={{ y: reducedMotion ? 0 : bgParallaxY }}
      onPointerMove={onPointerMove}
      aria-hidden
    >
      <div className="hub-hero-v3-void" />

      <motion.div
        className="hub-hero-v3-rays"
        style={{ rotate: reducedMotion ? 0 : raysRotate }}
        animate={reducedMotion ? undefined : { opacity: [0.35, 0.7, 0.4] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="hub-hero-v3-flag-wave"
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, 14, -8, 10, 0],
                y: [0, -8, 5, -4, 0],
                skewX: [-1.5, 2, -1, 1.5, -1.5],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 22, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="hub-hero-v3-flag"
          style={{ x: flagX, y: flagY, scale: 1.12 }}
        />
      </motion.div>

      <div className="hub-hero-v3-grid" />
      <div className="hub-hero-v3-scan" />

      <div className="hub-hero-v3-light-pools" />

      {PARTICLES.map((particle, i) => (
        <motion.span
          key={i}
          className={`hub-hero-v3-particle ${particleToneClass[particle.tone]}`}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.4 }
              : {
                  y: [0, -42, -18, -56, 0],
                  x: [0, 10, -8, 12, 0],
                  opacity: [0.2, 0.85, 0.45, 0.9, 0.2],
                  scale: [1, 1.35, 0.85, 1.25, 1],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      <div className="hub-hero-v3-vignette" />
    </motion.div>
  );
}