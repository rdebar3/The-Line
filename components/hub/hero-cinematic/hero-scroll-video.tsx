"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import {
  getHeroScrollFrameBlend,
  getHeroScrollFrameSrc,
  HERO_SCROLL_FRAME_COUNT,
} from "@/lib/hero-scroll-frames";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HeroScrollVideoProps = {
  children: ReactNode;
};

function getImageSize(image: CanvasImageSource) {
  if ("naturalWidth" in image && image.naturalWidth) {
    return { width: image.naturalWidth, height: image.naturalHeight };
  }

  if ("videoWidth" in image && image.videoWidth) {
    return { width: image.videoWidth, height: image.videoHeight };
  }

  return { width: 0, height: 0 };
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number
) {
  const { width: sourceWidth, height: sourceHeight } = getImageSize(image);
  if (!sourceWidth || !sourceHeight) return;

  const sourceRatio = sourceWidth / sourceHeight;
  const canvasRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceRatio > canvasRatio) {
    drawHeight = width / sourceRatio;
    offsetY = (height - drawHeight) / 2;
  } else {
    drawWidth = height * sourceRatio;
    offsetX = (width - drawWidth) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function HeroScrollVideo({ children }: HeroScrollVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const paintedProgressRef = useRef(-1);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onImageReady = () => {
      loaded += 1;
      if (!cancelled && loaded >= Math.min(24, HERO_SCROLL_FRAME_COUNT)) {
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
      paintedProgressRef.current = -1;
    };

    const paintProgress = (nextProgress: number) => {
      if (Math.abs(nextProgress - paintedProgressRef.current) < 0.0005) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { index, blend } = getHeroScrollFrameBlend(nextProgress);
      const frameA = framesRef.current[index];
      const frameB = framesRef.current[Math.min(index + 1, HERO_SCROLL_FRAME_COUNT - 1)];

      if (!frameA?.complete || !frameA.naturalWidth) return;

      context.fillStyle = "#04060c";
      context.fillRect(0, 0, width, height);

      context.globalAlpha = 1;
      drawContain(context, frameA, width, height);

      if (blend > 0 && frameB?.complete && frameB.naturalWidth) {
        context.globalAlpha = blend;
        drawContain(context, frameB, width, height);
      }

      context.globalAlpha = 1;
      paintedProgressRef.current = nextProgress;
    };

    const syncScroll = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const rect = section.getBoundingClientRect();
      const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollable));
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (!ready) return;

      paintProgress(nextProgress);
    };

    const loop = () => {
      syncScroll();
      frame = window.requestAnimationFrame(loop);
    };

    resizeCanvas();
    syncScroll();
    frame = window.requestAnimationFrame(loop);

    window.addEventListener("resize", resizeCanvas, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(frame);
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

        <div className="hub-hero-scrub-layout">{children}</div>

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