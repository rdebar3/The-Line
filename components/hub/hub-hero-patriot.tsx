"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { CHARACTER_NAME, GUARDIAN_IMAGE } from "@/lib/guardian";

export function HubHeroPatriot() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 0.98]);

  return (
    <motion.div
      ref={ref}
      className="hub-hero-patriot"
      style={{ y, scale }}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hub-hero-patriot-aura" />
      <div className="hub-hero-patriot-aura hub-hero-patriot-aura--crimson" />
      <div className="hub-hero-patriot-edge-glow" />
      <motion.div
        className="hub-hero-patriot-cloak"
        animate={{ rotate: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={GUARDIAN_IMAGE}
          alt={CHARACTER_NAME}
          fill
          priority
          sizes="(max-width: 640px) 280px, (max-width: 1024px) 380px, 480px"
          className="hub-hero-patriot-image"
        />
      </motion.div>
      <p className="hub-hero-patriot-label">{CHARACTER_NAME}</p>
    </motion.div>
  );
}