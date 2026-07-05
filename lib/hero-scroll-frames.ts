export const HERO_SCROLL_FRAME_COUNT = 301;
export const HERO_SCRUB_FRACTION = 0.72;
export const HERO_PANEL_REVEAL_START = 0.88;

export function getHeroScrollFrameSrc(frameIndex: number): string {
  const frame = Math.min(
    HERO_SCROLL_FRAME_COUNT,
    Math.max(1, Math.floor(frameIndex) + 1)
  );

  return `/hero/frames/frame_${String(frame).padStart(4, "0")}.jpg`;
}

function smoothstep(value: number): number {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function getHeroScrollFrameBlend(progress: number): {
  index: number;
  blend: number;
} {
  const clamped = Math.min(1, Math.max(0, progress));
  const floatIndex = clamped * (HERO_SCROLL_FRAME_COUNT - 1);
  const index = Math.floor(floatIndex);
  const blend = smoothstep(floatIndex - index);

  return {
    index: Math.min(HERO_SCROLL_FRAME_COUNT - 2, Math.max(0, index)),
    blend,
  };
}

export function getHeroVideoProgress(rawScrollProgress: number): number {
  const raw = Math.min(1, Math.max(0, rawScrollProgress));
  return Math.min(1, raw / HERO_SCRUB_FRACTION);
}

export function getHeroPanelReveal(videoProgress: number): number {
  if (videoProgress <= HERO_PANEL_REVEAL_START) return 0;
  return Math.min(
    1,
    (videoProgress - HERO_PANEL_REVEAL_START) /
      (1 - HERO_PANEL_REVEAL_START)
  );
}