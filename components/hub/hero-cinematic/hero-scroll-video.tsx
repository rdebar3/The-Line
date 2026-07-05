"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import {
  getHeroScrollFrameIndex,
  getHeroScrollFrameSrc,
  HERO_SCROLL_FRAME_COUNT,
} from "@/lib/hero-scroll-frames";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HeroScrollVideoProps = {
  children: ReactNode;
};

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number
) {
  const sourceWidth =
    "videoWidth" in image
      ? image.videoWidth
      : "naturalWidth" in image
        ? image.naturalWidth
        : width;
  const sourceHeight =
    "videoHeight" in image
      ? image.videoHeight
      : "naturalHeight" in image
        ? image.naturalHeight
        : height;

  if (!sourceWidth || !sourceHeight) return;

  const sourceRatio = sourceWidth / sourceHeight;
  const canvasRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceRatio > canvasRatio) {
    drawWidth = height * sourceRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawHeight = width / sourceRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function HeroScrollVideo({ children }: HeroScrollVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const paintedFrameRef = useRef(-1);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onImageReady = () => {
      loaded += 1;
      if (!cancelled && loaded >= 1) {
        setReady(true);
      }
    };

    for (let index = 0; index < HERO_SCROLL_FRAME_COUNT; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.src = getHeroScrollFrameSrc(index);
      image.onload = onImageReady;
      image.onerror = onImageReady;
      images.push(image);
    }

    framesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;

    const resizeCanvas = () => {
      const sticky = canvas.parentElement;
      if (!sticky) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = sticky.clientWidth;
      const height = sticky.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintedFrameRef.current = -1;
    };

    const paintFrame = (frameIndex: number) => {
      if (frameIndex === paintedFrameRef.current) return;

      const image = framesRef.current[frameIndex];
      if (!image?.complete || !image.naturalWidth) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      context.fillStyle = "#04060c";
      context.fillRect(0, 0, width, height);
      drawCover(context, image, width, height);
      paintedFrameRef.current = frameIndex;
    };

    const syncScroll = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const rect = section.getBoundingClientRect();
      const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollable));
      setProgress(nextProgress);

      if (!ready) return;

      paintFrame(getHeroScrollFrameIndex(nextProgress));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncScroll);
    };

    resizeCanvas();
    syncScroll();

    if (ready) {
      paintFrame(
        reducedMotion ? 0 : getHeroScrollFrameIndex(progress)
      );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ready, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={reducedMotion ? "hub-hero-scrub hub-hero-scrub--static" : "hub-hero-scrub"}
      aria-label="Hero"
    >
      <div className="hub-hero-scrub-sticky">
        <canvas ref={canvasRef} className="hub-hero-scrub-canvas" aria-hidden />

        <div className="hub-hero-scrub-overlay" aria-hidden />
        <div className="hub-hero-scrub-vignette" aria-hidden />

        <div className="hub-hero-scrub-layout">
          <div className="hub-hero-scrub-spacer" aria-hidden />
          {children}
        </div>

        <div
          className="hub-hero-scrub-progress"
          aria-hidden
          style={{ transform: `scaleX(${ready ? progress : 0})` }}
        />

        {progress < 0.98 && !reducedMotion && (
          <div className="hub-hero-scrub-hint" aria-hidden>
            <ChevronDown className="size-4 animate-bounce" />
            <span>Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}