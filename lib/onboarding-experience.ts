export const WELCOME_ONBOARDING_KEY = "theline_welcome_onboarding_v1";

export type OnboardingHintId = "rights_under_pressure" | "quick_drills";

const HINT_KEYS: Record<OnboardingHintId, string> = {
  rights_under_pressure: "theline_hint_rights_under_pressure_v1",
  quick_drills: "theline_hint_quick_drills_v1",
};

export function readWelcomeOnboardingComplete() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WELCOME_ONBOARDING_KEY) === "true";
}

export function writeWelcomeOnboardingComplete() {
  if (typeof window === "undefined") return;
  localStorage.setItem(WELCOME_ONBOARDING_KEY, "true");
}

export function hasSeenFeatureHint(hintId: OnboardingHintId) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(HINT_KEYS[hintId]) === "true";
}

export function markFeatureHintSeen(hintId: OnboardingHintId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HINT_KEYS[hintId], "true");
}