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

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -48]);

  return (
    <motion.div
      ref={ref}
      className="hub-hero-patriot"
      style={{ y: parallaxY }}
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="hub-hero-patriot-glow hub-hero-patriot-glow--gold"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hub-hero-patriot-glow hub-hero-patriot-glow--crimson"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.05, 1.15, 1.05] }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />
      <motion.div
        className="hub-hero-patriot-glow hub-hero-patriot-glow--edge"
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="hub-hero-patriot-figure"
        animate={{ scale: [1, 1.028, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="hub-hero-patriot-cloak"
          animate={{
            rotate: [-0.8, 0.8, -0.8],
            skewX: [-0.5, 0.5, -0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={GUARDIAN_IMAGE}
            alt={CHARACTER_NAME}
            fill
            priority
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 520px"
            className="hub-hero-patriot-image"
          />
        </motion.div>
      </motion.div>

      <p className="hub-hero-patriot-label">{CHARACTER_NAME}</p>
    </motion.div>
  );
}