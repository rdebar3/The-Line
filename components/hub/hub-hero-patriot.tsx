"use client";

import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";

import { CHARACTER_NAME, GUARDIAN_IMAGE } from "@/lib/guardian";

type HubHeroPatriotProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

export function HubHeroPatriot({ mouseX, mouseY }: HubHeroPatriotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 22 });
  const tiltX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const shiftX = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  return (
    <motion.div
      ref={ref}
      className="hub-hero-patriot"
      style={{ y: scrollY, x: shiftX, rotateX: tiltX, rotateY: tiltY }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="hub-hero-patriot-spotlight"
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="hub-hero-patriot-glow hub-hero-patriot-glow--gold"
        animate={{ opacity: [0.45, 0.95, 0.45], scale: [1, 1.14, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hub-hero-patriot-glow hub-hero-patriot-glow--crimson"
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [1.08, 1.2, 1.08] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="hub-hero-patriot-figure"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="hub-hero-patriot-cloak"
          animate={{ rotate: [-1, 1, -1], skewX: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={GUARDIAN_IMAGE}
            alt={CHARACTER_NAME}
            fill
            priority
            sizes="(max-width: 640px) 360px, (max-width: 1024px) 480px, 560px"
            className="hub-hero-patriot-image"
          />
        </motion.div>
      </motion.div>

      <motion.p
        className="hub-hero-patriot-label"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {CHARACTER_NAME}
      </motion.p>
    </motion.div>
  );
}