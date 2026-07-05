"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: "gold" | "crimson";
};

export function HubHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      const count = width < 640 ? 18 : 36;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.08 - Math.random() * 0.18,
        size: 1 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.45,
        hue: Math.random() > 0.65 ? "crimson" : "gold",
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -8) {
          p.y = height + 8;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3
        );
        if (p.hue === "gold") {
          gradient.addColorStop(0, `rgba(201,162,39,${p.alpha})`);
          gradient.addColorStop(1, "rgba(201,162,39,0)");
        } else {
          gradient.addColorStop(0, `rgba(185,28,28,${p.alpha * 0.8})`);
          gradient.addColorStop(1, "rgba(185,28,28,0)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    seed();

    if (!prefersReduced) {
      raf = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(() => {
      resize();
      seed();
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hub-hero-canvas"
      aria-hidden
    />
  );
}