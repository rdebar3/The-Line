"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const PARTICLES = [
  { left: "12%", top: "18%", size: 3, delay: 0 },
  { left: "78%", top: "24%", size: 2, delay: 1.2 },
  { left: "45%", top: "12%", size: 2, delay: 0.6 },
  { left: "88%", top: "62%", size: 3, delay: 2 },
  { left: "22%", top: "72%", size: 2, delay: 1.8 },
  { left: "62%", top: "80%", size: 2, delay: 0.9 },
  { left: "8%", top: "48%", size: 2, delay: 2.4 },
  { left: "52%", top: "38%", size: 3, delay: 1.5 },
] as const;

export function HubHeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const particleY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div ref={ref} className="hub-hero-bg" aria-hidden>
      <div className="hub-hero-bg-void" />

      <motion.div
        className="hub-hero-bg-flag"
        style={{ y: parallaxY }}
        animate={{
          x: [0, 14, 0],
          scale: [1, 1.03, 1],
          opacity: [0.18, 0.26, 0.18],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="hub-hero-bg-holo"
        style={{ y: parallaxY }}
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="hub-hero-bg-grid"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div className="hub-hero-bg-particles" style={{ y: particleY }}>
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="hub-hero-bg-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.25, 0.65, 0.25],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 8 + p.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </motion.div>

      <div className="hub-hero-bg-scan" />
      <div className="hub-hero-bg-vignette" />
    </div>
  );
}