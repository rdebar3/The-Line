"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useCallback } from "react";

const EMBERS = [
  { left: "8%", top: "18%", size: 3, duration: 7.2, delay: 0 },
  { left: "22%", top: "72%", size: 2, duration: 9.4, delay: 1.2 },
  { left: "34%", top: "42%", size: 4, duration: 8.1, delay: 0.6 },
  { left: "48%", top: "28%", size: 2, duration: 10.2, delay: 2.1 },
  { left: "56%", top: "65%", size: 3, duration: 7.8, delay: 0.9 },
  { left: "68%", top: "22%", size: 2, duration: 11, delay: 1.8 },
  { left: "74%", top: "58%", size: 4, duration: 8.6, delay: 0.3 },
  { left: "82%", top: "38%", size: 2, duration: 9.8, delay: 2.4 },
  { left: "14%", top: "52%", size: 3, duration: 10.5, delay: 1.5 },
  { left: "41%", top: "78%", size: 2, duration: 7.5, delay: 3 },
  { left: "88%", top: "14%", size: 3, duration: 8.9, delay: 0.45 },
  { left: "62%", top: "84%", size: 2, duration: 9.2, delay: 2.8 },
] as const;

type HeroBackgroundProps = {
  reducedMotion?: boolean;
};

export function HeroBackground({ reducedMotion = false }: HeroBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const flagX = useTransform(mouseX, [-0.5, 0.5], reducedMotion ? [0, 0] : [-18, 18]);
  const flagY = useTransform(mouseY, [-0.5, 0.5], reducedMotion ? [0, 0] : [-10, 10]);

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
    <div
      className="hub-hero-cinematic-bg"
      onPointerMove={onPointerMove}
      aria-hidden
    >
      <motion.div
        className="hub-hero-cinematic-flag-drift"
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 10, -6, 0], y: [0, -5, 3, 0] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 28, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="hub-hero-cinematic-flag"
          style={{ x: flagX, y: flagY, scale: 1.08 }}
        />
      </motion.div>

      <div className="hub-hero-cinematic-grid" />

      <div className="hub-hero-cinematic-light-pools" />

      {EMBERS.map((ember, i) => (
        <motion.span
          key={i}
          className="hub-hero-cinematic-ember"
          style={{
            left: ember.left,
            top: ember.top,
            width: ember.size,
            height: ember.size,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.35 }
              : {
                  y: [0, -28, -12, -36, 0],
                  x: [0, 6, -4, 8, 0],
                  opacity: [0.25, 0.65, 0.4, 0.7, 0.25],
                  scale: [1, 1.2, 0.9, 1.15, 1],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: ember.duration,
                  repeat: Infinity,
                  delay: ember.delay,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      <div className="hub-hero-cinematic-vignette" />
    </div>
  );
}