export type OnboardingGoal = "traffic" | "speech" | "general";

export type OnboardingState = {
  completed: boolean;
  goal: OnboardingGoal | null;
  completedAt: string | null;
};

export const ONBOARDING_GOALS: {
  id: OnboardingGoal;
  label: string;
  description: string;
  trainingHref: string;
  documentHref: string;
}[] = [
  {
    id: "traffic",
    label: "Traffic & searches",
    description: "4th Amendment pressure — stops, consent, and warrants.",
    trainingHref: "/rights-under-pressure",
    documentHref: "/bill-of-rights#amendment-iv",
  },
  {
    id: "speech",
    label: "Free speech",
    description: "1st Amendment — permits, protest, and viewpoint limits.",
    trainingHref: "/rights-under-pressure",
    documentHref: "/bill-of-rights#amendment-i",
  },
  {
    id: "general",
    label: "General civic defense",
    description: "Founding documents, daily drills, and Defender rank.",
    trainingHref: "/rights-under-pressure",
    documentHref: "/declaration",
  },
];

export function createInitialOnboardingState(): OnboardingState {
  return { completed: false, goal: null, completedAt: null };
}

export function completeOnboarding(
  state: OnboardingState,
  goal: OnboardingGoal
): OnboardingState {
  return {
    completed: true,
    goal,
    completedAt: new Date().toISOString(),
  };
}