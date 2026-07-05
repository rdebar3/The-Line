"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";

const FRAGMENTS = [
  { text: "We the People", angle: 0 },
  { text: "shall not be infringed", angle: 72 },
  { text: "self-evident truths", angle: 144 },
  { text: "ordain & establish", angle: 216 },
  { text: "hold the line", angle: 288 },
] as const;

export function HubHeroOrbit() {
  return (
    <div className="hub-hero-orbit" aria-hidden>
      <motion.div
        className="hub-hero-orbit-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="hub-hero-orbit-track"
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {FRAGMENTS.map((f) => (
          <span
            key={f.text}
            className="hub-hero-orbit-fragment"
            style={{ "--orbit-angle": `${f.angle}deg` } as CSSProperties}
          >
            {f.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}