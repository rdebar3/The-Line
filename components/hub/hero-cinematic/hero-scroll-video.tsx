"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import {
  getHeroPanelReveal,
  getHeroScrollFrameBlend,
  getHeroScrollFrameSrc,
  getHeroVideoProgress,
  HERO_PANEL_REVEAL_START,
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

/** Mobile: full-width cover crop — unchanged from approved mobile look. */
const MOBILE_FOCAL_Y = 0.4;

function drawMobileCover(
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
    drawHeight = height;
    drawWidth = height * sourceRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / sourceRatio;
    offsetY = (height - drawHeight) * MOBILE_FOCAL_Y;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

/** Laptop/desktop: zoomed-out contain so the full flag drop stays centered and visible. */
function drawDesktopFrame(
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

  if (sourceRatio > canvasRatio) {
    drawWidth = width;
    drawHeight = width / sourceRatio;
  } else {
    drawHeight = height;
    drawWidth = height * sourceRatio;
  }

  const zoom = 0.93;
  drawWidth *= zoom;
  drawHeight *= zoom;

  const offsetX = (width - drawWidth) / 2;
  const offsetY = Math.max(0, (height - drawHeight) * 0.04);

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawHeroFrame(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  isDesktop: boolean
) {
  if (isDesktop) {
    drawDesktopFrame(ctx, image, width, height);
    return;
  }

  drawMobileCover(ctx, image, width, height);
}

function isDesktopViewport() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function HeroScrollVideo({ children }: HeroScrollVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const displayProgressRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [rawProgress, setRawProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const onImageReady = () => {
      loaded += 1;
      if (!cancelled && loaded >= Math.min(48, HERO_SCROLL_FRAME_COUNT)) {
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

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

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
      displayProgressRef.current = -1;
    };

    const paintProgress = (nextProgress: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { index, blend } = getHeroScrollFrameBlend(nextProgress);
      const frameA = framesRef.current[index];
      const frameB = framesRef.current[index + 1];

      if (!frameA?.complete || !frameA.naturalWidth) return;

      context.fillStyle = "#0a1018";
      context.fillRect(0, 0, width, height);

      context.filter = "brightness(1.65) contrast(1.1) saturate(1.15)";

      const desktop = isDesktopViewport();

      context.globalAlpha = 1 - blend;
      drawHeroFrame(context, frameA, width, height, desktop);

      if (frameB?.complete && frameB.naturalWidth) {
        context.globalAlpha = blend;
        drawHeroFrame(context, frameB, width, height, desktop);
      }

      context.filter = "none";
      context.globalAlpha = 1;
      displayProgressRef.current = nextProgress;
    };

    const syncScroll = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const rect = section.getBoundingClientRect();
      const nextRaw = Math.min(1, Math.max(0, -rect.top / scrollable));
      const targetVideo = getHeroVideoProgress(nextRaw);

      setRawProgress(nextRaw);
      setVideoProgress(targetVideo);

      if (!ready) return;

      const current = displayProgressRef.current < 0 ? targetVideo : displayProgressRef.current;
      const smoothed =
        current + (targetVideo - current) * (reducedMotion ? 1 : 0.2);

      paintProgress(smoothed);
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

  const panelReveal = reducedMotion ? 1 : getHeroPanelReveal(videoProgress);

  return (
    <section
      ref={sectionRef}
      className={reducedMotion ? "hub-hero-scrub hub-hero-scrub--static" : "hub-hero-scrub"}
      aria-label="Hero"
    >
      <div
        className="hub-hero-scrub-sticky"
        style={{ "--hero-progress": videoProgress } as React.CSSProperties}
      >
        <canvas ref={canvasRef} className="hub-hero-scrub-canvas" aria-hidden />

        <div className="hub-hero-scrub-overlay" aria-hidden />
        <div className="hub-hero-scrub-vignette" aria-hidden />

        <div
          className="hub-hero-scrub-layout"
          style={{
            opacity: panelReveal,
            transform: `translateY(${(1 - panelReveal) * 28}px)`,
            pointerEvents: panelReveal > 0.35 ? "auto" : "none",
          }}
        >
          <div className="hub-hero-scrub-panel-wrap">{children}</div>
        </div>

        <div
          className="hub-hero-scrub-progress"
          aria-hidden
          style={{ transform: `scaleX(${ready ? rawProgress : 0})` }}
        />

        {videoProgress < HERO_PANEL_REVEAL_START && !reducedMotion && (
          <div className="hub-hero-scrub-hint" aria-hidden>
            <ChevronDown className="size-4 animate-bounce" />
            <span>Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}