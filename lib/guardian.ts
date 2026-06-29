export type GuardianMood = "neutral" | "success" | "warning" | "thinking";

export const CHARACTER_NAME = "No Face Patriot";

export const GUARDIAN_IMAGE =
  "/grok-image-4dd75827-9ec7-4768-848a-a596777d1ebc.jpg";

export const guardianImages: Record<GuardianMood, string> = {
  neutral: GUARDIAN_IMAGE,
  success: GUARDIAN_IMAGE,
  warning: GUARDIAN_IMAGE,
  thinking: GUARDIAN_IMAGE,
};

export const guardianLabels: Record<GuardianMood, string> = {
  neutral: CHARACTER_NAME,
  success: "Line Held",
  warning: "Line Tested",
  thinking: "Studying the Text",
};