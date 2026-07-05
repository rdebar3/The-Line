export const WAR_ROOM_COUNT = 5;
export const WAR_ROOM_SPACING = 14;

export const WAR_ROOM_LABELS = [
  "Command Hub",
  "Archives Room",
  "Training Bay",
  "Strategy Chamber",
  "Memorial Hall",
] as const;

export const PALETTE = {
  void: "#060a14",
  navy: "#0a0f1c",
  gold: "#c9a227",
  crimson: "#b91c1c",
  blue: "#3b5998",
} as const;

export function getWarRoomY(index: number) {
  return -index * WAR_ROOM_SPACING;
}