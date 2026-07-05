"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

type HubHeroBackgroundProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

const AURORA = [
  { className: "hub-hero-aurora hub-hero-aurora--gold", duration: 18, delay: 0 },
  { className: "hub-hero-aurora hub-hero-aurora--crimson", duration: 22, delay: 2 },
  { className: "hub-hero-aurora hub-hero-aurora--blue", duration: 26, delay: 4 },
] as const;

export function HubHeroBackground({ mouseX, mouseY }: HubHeroBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scrollY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  return (
    <div ref={ref} className="hub-hero-bg" aria-hidden>
      <div className="hub-hero-bg-void" />
      <div className="hub-hero-bg-watermark">WE THE PEOPLE</div>

      <motion.div className="hub-hero-bg-flag" style={{ y: scrollY }} />

      <motion.div
        className="hub-hero-bg-aurora-field"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {AURORA.map((blob) => (
          <motion.div
            key={blob.className}
            className={blob.className}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -24, 16, 0],
              scale: [1, 1.12, 0.95, 1],
              opacity: [0.5, 0.85, 0.55, 0.5],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: blob.delay,
            }}
          />
        ))}
      </motion.div>

      <div className="hub-hero-bg-grid" />
      <div className="hub-hero-bg-stars" />
      <div className="hub-hero-bg-spotlight" />
      <div className="hub-hero-bg-scan" />
      <div className="hub-hero-bg-vignette" />
    </div>
  );
}