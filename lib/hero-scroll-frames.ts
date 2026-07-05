export const HERO_SCROLL_FRAME_COUNT = 241;

export function getHeroScrollFrameSrc(frameIndex: number): string {
  const frame = Math.min(
    HERO_SCROLL_FRAME_COUNT,
    Math.max(1, Math.floor(frameIndex) + 1)
  );

  return `/hero/frames/frame_${String(frame).padStart(4, "0")}.jpg`;
}

export function getHeroScrollFrameBlend(progress: number): {
  index: number;
  blend: number;
} {
  const clamped = Math.min(1, Math.max(0, progress));
  const floatIndex = clamped * (HERO_SCROLL_FRAME_COUNT - 1);
  const index = Math.floor(floatIndex);
  const blend = floatIndex - index;

  return {
    index: Math.min(HERO_SCROLL_FRAME_COUNT - 1, index),
    blend: Math.min(1, Math.max(0, blend)),
  };
}