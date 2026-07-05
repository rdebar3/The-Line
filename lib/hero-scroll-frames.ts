export const HERO_SCROLL_FRAME_COUNT = 121;

export function getHeroScrollFrameSrc(frameIndex: number): string {
  const frame = Math.min(
    HERO_SCROLL_FRAME_COUNT,
    Math.max(1, frameIndex + 1)
  );

  return `/hero/frames/frame_${String(frame).padStart(4, "0")}.jpg`;
}

export function getHeroScrollFrameIndex(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.round(clamped * (HERO_SCROLL_FRAME_COUNT - 1));
}