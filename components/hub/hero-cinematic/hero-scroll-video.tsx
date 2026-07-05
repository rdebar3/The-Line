"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const HERO_VIDEO_SRC = "/hero/hero-chamber-scroll.mp4";

type HeroScrollVideoProps = {
  children: ReactNode;
};

function seekVideo(video: HTMLVideoElement, time: number) {
  if ("fastSeek" in video && typeof video.fastSeek === "function") {
    try {
      video.fastSeek(time);
      return;
    } catch {
      // Fall through to currentTime assignment.
    }
  }

  video.currentTime = time;
}

export function HeroScrollVideo({ children }: HeroScrollVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let frame = 0;
    let primed = false;

    const primeFirstFrame = () => {
      if (primed || reducedMotion) return;
      primed = true;
      video.pause();
      seekVideo(video, 0.001);
    };

    const syncVideo = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const rect = section.getBoundingClientRect();
      const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollable));
      setProgress(nextProgress);

      if (reducedMotion) return;

      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;

      seekVideo(video, nextProgress * duration);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncVideo);
    };

    const onVideoReady = () => {
      setReady(true);
      primeFirstFrame();
      syncVideo();
    };

    video.pause();
    video.load();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    video.addEventListener("loadeddata", onVideoReady);
    video.addEventListener("loadedmetadata", onVideoReady);

    if (video.readyState >= 2) {
      onVideoReady();
    } else {
      syncVideo();
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadeddata", onVideoReady);
      video.removeEventListener("loadedmetadata", onVideoReady);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={reducedMotion ? "hub-hero-scrub hub-hero-scrub--static" : "hub-hero-scrub"}
      aria-label="Hero"
    >
      <div className="hub-hero-scrub-sticky">
        <video
          ref={videoRef}
          className="hub-hero-scrub-video"
          src={HERO_VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
        />

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

        {progress < 0.92 && !reducedMotion && (
          <div className="hub-hero-scrub-hint" aria-hidden>
            <ChevronDown className="size-4 animate-bounce" />
            <span>Scroll</span>
          </div>
        )}
      </div>
    </section>
  );
}