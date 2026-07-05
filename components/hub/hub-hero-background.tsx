"use client";

import { motion } from "motion/react";

import { HubHeroCanvas } from "@/components/hub/hub-hero-canvas";

export function HubHeroBackground() {
  return (
    <div className="hub-hero-prime-bg-wrap" aria-hidden>
      <motion.div
        className="hub-hero-prime-bg-image"
        animate={{ scale: [1, 1.06, 1], x: [0, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="hub-hero-prime-bg-grade" />
      <div className="hub-hero-prime-bg-grid" />
      <HubHeroCanvas />
      <div className="hub-hero-prime-bg-vignette" />
    </div>
  );
}