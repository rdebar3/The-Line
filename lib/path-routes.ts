export const PATH_ROUTES = {
  overview: "/path",
  drill: "/path/drill",
  scenario: "/path/scenario",
  simulator: "/path/simulator",
} as const;

export type PathStepParam = "read" | "drill" | "scenario" | "certify";

export function pathOverviewHref(options?: {
  step?: PathStepParam;
  unit?: string;
}): string {
  if (!options?.step && !options?.unit) {
    return PATH_ROUTES.overview;
  }

  const params = new URLSearchParams();
  if (options.step) params.set("step", options.step);
  if (options.unit) params.set("unit", options.unit);
  return `${PATH_ROUTES.overview}?${params.toString()}`;
}

/** Legacy standalone entry points → path overview or nested experience. */
export const LEGACY_TRAINING_REDIRECTS = {
  "/rights-under-pressure": pathOverviewHref({ step: "scenario" }),
  "/quick-drills": pathOverviewHref({ step: "drill" }),
  "/republic-simulator": PATH_ROUTES.simulator,
} as const;