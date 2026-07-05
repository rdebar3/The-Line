"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function HubHeroBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const flagY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"]);
  const emberY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <div ref={ref} className="hub-hero-bg" aria-hidden>
      <div className="hub-hero-bg-void" />
      <motion.div className="hub-hero-bg-flag" style={{ y: flagY }} />
      <motion.div className="hub-hero-bg-holo" style={{ y: flagY }} />
      <motion.div className="hub-hero-bg-grid" style={{ y: gridY }} />
      <motion.div className="hub-hero-bg-embers" style={{ y: emberY }} />
      <div className="hub-hero-bg-rays" />
      <div className="hub-hero-bg-scan" />
      <div className="hub-hero-bg-vignette" />
    </div>
  );
}