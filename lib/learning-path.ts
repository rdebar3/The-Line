import type { DocumentSlug } from "@/lib/document-links";
import {
  CERTIFICATION_DEFINITIONS,
  type CertificationId,
  type DocumentTrackId,
  getCertificationProgress,
  getDocumentTrackStats,
} from "@/lib/certifications";
import {
  getDocumentReadProgress,
  getViewedPassages,
} from "@/lib/document-progress";
import { getMasteryTracks } from "@/lib/mastery-tracks";
import { PATH_ROUTES } from "@/lib/path-routes";
import type { ProgressionState } from "@/lib/progression";

export type PathStepId = "read" | "drill" | "scenario" | "certify";

export type PathStepStatus = "locked" | "available" | "in-progress" | "complete";

export type PathUnitStatus = "locked" | "in-progress" | "complete";

export type PathStep = {
  id: PathStepId;
  label: string;
  description: string;
  href: string;
  status: PathStepStatus;
  progressLabel: string | null;
};

export type PathUnit = {
  id: DocumentTrackId;
  order: number;
  title: string;
  subtitle: string;
  slug: DocumentSlug;
  readHref: string;
  status: PathUnitStatus;
  certificationId: CertificationId;
  certificationTitle: string;
  overallProgress: number;
  steps: PathStep[];
};

const UNIT_SEQUENCE: {
  id: DocumentTrackId;
  title: string;
  subtitle: string;
  slug: DocumentSlug;
  readHref: string;
  certificationId: CertificationId;
}[] = [
  {
    id: "declaration",
    title: "Declaration of Independence",
    subtitle: "Natural rights & consent of the governed",
    slug: "declaration",
    readHref: "/declaration",
    certificationId: "declaration-defender",
  },
  {
    id: "constitution",
    title: "U.S. Constitution",
    subtitle: "Structure, powers & republican government",
    slug: "constitution",
    readHref: "/constitution",
    certificationId: "constitution-guardian",
  },
  {
    id: "bill-of-rights",
    title: "Bill of Rights",
    subtitle: "Individual liberties & limits on power",
    slug: "bill-of-rights",
    readHref: "/bill-of-rights",
    certificationId: "bill-of-rights-sentinel",
  },
];

const STEP_LINKS = {
  drill: PATH_ROUTES.drill,
  scenario: PATH_ROUTES.scenario,
  certify: "/certifications",
} as const;

function hasCertification(
  state: ProgressionState,
  certificationId: CertificationId
): boolean {
  return (state.certifications ?? []).some((cert) => cert.id === certificationId);
}

function isPriorUnitComplete(
  state: ProgressionState,
  unitIndex: number
): boolean {
  if (unitIndex <= 0) return true;
  const prior = UNIT_SEQUENCE[unitIndex - 1];
  return hasCertification(state, prior.certificationId);
}

function unitHasAnyProgress(
  state: ProgressionState,
  trackId: DocumentTrackId,
  slug: DocumentSlug
): boolean {
  const viewed = getViewedPassages(state)[slug] ?? [];
  const read = getDocumentReadProgress(slug, viewed);
  const mastery = getMasteryTracks(state).find((track) => track.id === trackId);
  const scenarios = getDocumentTrackStats(state, trackId);

  return (
    read.read > 0 ||
    (mastery?.answered ?? 0) > 0 ||
    scenarios.total > 0
  );
}

function resolveUnitStatus(
  state: ProgressionState,
  unitIndex: number,
  trackId: DocumentTrackId,
  slug: DocumentSlug,
  certificationId: CertificationId
): PathUnitStatus {
  if (hasCertification(state, certificationId)) return "complete";

  const priorComplete = isPriorUnitComplete(state, unitIndex);
  const hasProgress = unitHasAnyProgress(state, trackId, slug);

  if (!priorComplete && !hasProgress) return "locked";
  return "in-progress";
}

function resolveReadStep(
  unitLocked: boolean,
  slug: DocumentSlug,
  readIds: string[]
): Pick<PathStep, "status" | "progressLabel"> {
  if (unitLocked) {
    return { status: "locked", progressLabel: null };
  }

  const progress = getDocumentReadProgress(slug, readIds);
  if (progress.complete) {
    return {
      status: "complete",
      progressLabel: `${progress.total}/${progress.total} passages`,
    };
  }

  if (progress.read > 0) {
    return {
      status: "in-progress",
      progressLabel: `${progress.read}/${progress.total} passages`,
    };
  }

  return {
    status: "available",
    progressLabel: `0/${progress.total} passages`,
  };
}

function resolveDrillStep(
  unitLocked: boolean,
  trackId: DocumentTrackId,
  masteryTracks: ReturnType<typeof getMasteryTracks>
): Pick<PathStep, "status" | "progressLabel"> {
  if (unitLocked) {
    return { status: "locked", progressLabel: null };
  }

  const track = masteryTracks.find((entry) => entry.id === trackId);
  const answered = track?.answered ?? 0;
  const accuracy = track?.accuracy ?? 0;

  if (track?.mastered) {
    return {
      status: "complete",
      progressLabel: `${accuracy}% · ${answered} answered`,
    };
  }

  if (answered > 0) {
    return {
      status: "in-progress",
      progressLabel: `${accuracy}% · ${answered}/5 drills`,
    };
  }

  return {
    status: "available",
    progressLabel: "0 drills completed",
  };
}

function resolveScenarioStep(
  unitLocked: boolean,
  trackId: DocumentTrackId,
  state: ProgressionState,
  certificationId: CertificationId
): Pick<PathStep, "status" | "progressLabel"> {
  if (unitLocked) {
    return { status: "locked", progressLabel: null };
  }

  const definition = CERTIFICATION_DEFINITIONS.find(
    (cert) => cert.id === certificationId
  )!;
  const stats = getDocumentTrackStats(state, trackId);
  const scenariosMet =
    stats.total >= definition.minScenarios &&
    stats.accuracy >= definition.minAccuracy;

  if (scenariosMet) {
    return {
      status: "complete",
      progressLabel: `${stats.accuracy}% · ${stats.total} scenarios`,
    };
  }

  if (stats.total > 0) {
    return {
      status: "in-progress",
      progressLabel: `${stats.accuracy}% · ${stats.total}/${definition.minScenarios} scenarios`,
    };
  }

  return {
    status: "available",
    progressLabel: `0/${definition.minScenarios} scenarios`,
  };
}

function resolveCertifyStep(
  unitLocked: boolean,
  certProgress: ReturnType<typeof getCertificationProgress>
): Pick<PathStep, "status" | "progressLabel"> {
  if (unitLocked) {
    return { status: "locked", progressLabel: null };
  }

  if (certProgress.earned) {
    return {
      status: "complete",
      progressLabel: "Certification earned",
    };
  }

  if (certProgress.eligible) {
    return {
      status: "in-progress",
      progressLabel: "Requirements met — claim on next scenario",
    };
  }

  if (certProgress.overallProgress > 0) {
    return {
      status: "in-progress",
      progressLabel: `${certProgress.overallProgress}% toward certification`,
    };
  }

  return {
    status: "available",
    progressLabel: "Complete prior steps to qualify",
  };
}

function buildUnitSteps(
  state: ProgressionState,
  unit: (typeof UNIT_SEQUENCE)[number],
  unitStatus: PathUnitStatus,
  masteryTracks: ReturnType<typeof getMasteryTracks>
): PathStep[] {
  const unitLocked = unitStatus === "locked";
  const viewed = getViewedPassages(state)[unit.slug] ?? [];
  const certProgress = getCertificationProgress(
    state,
    CERTIFICATION_DEFINITIONS.find((cert) => cert.id === unit.certificationId)!
  );

  const read = resolveReadStep(unitLocked, unit.slug, viewed);
  const drill = resolveDrillStep(unitLocked, unit.id, masteryTracks);
  const scenario = resolveScenarioStep(
    unitLocked,
    unit.id,
    state,
    unit.certificationId
  );
  const certify = resolveCertifyStep(unitLocked, certProgress);

  return [
    {
      id: "read",
      label: "Read",
      description: "Study the founding text passage by passage.",
      href: unit.readHref,
      ...read,
    },
    {
      id: "drill",
      label: "Drill",
      description: "Quick missions to reinforce key principles.",
      href: STEP_LINKS.drill,
      ...drill,
    },
    {
      id: "scenario",
      label: "Scenario",
      description: "Apply the document under pressure in Rights Under Pressure.",
      href: STEP_LINKS.scenario,
      ...scenario,
    },
    {
      id: "certify",
      label: "Certify",
      description: "Earn your official Defender credential for this document.",
      href: STEP_LINKS.certify,
      ...certify,
    },
  ];
}

function calculateUnitProgress(steps: PathStep[]): number {
  const activeSteps = steps.filter((step) => step.status !== "locked");
  if (activeSteps.length === 0) return 0;

  const completed = activeSteps.filter((step) => step.status === "complete").length;
  return Math.round((completed / activeSteps.length) * 100);
}

export function getLearningPath(state: ProgressionState): PathUnit[] {
  const masteryTracks = getMasteryTracks(state);

  return UNIT_SEQUENCE.map((unit, index) => {
    const status = resolveUnitStatus(
      state,
      index,
      unit.id,
      unit.slug,
      unit.certificationId
    );
    const steps = buildUnitSteps(state, unit, status, masteryTracks);
    const certDefinition = CERTIFICATION_DEFINITIONS.find(
      (cert) => cert.id === unit.certificationId
    )!;

    return {
      id: unit.id,
      order: index + 1,
      title: unit.title,
      subtitle: unit.subtitle,
      slug: unit.slug,
      readHref: unit.readHref,
      status,
      certificationId: unit.certificationId,
      certificationTitle: certDefinition.title,
      overallProgress: status === "complete" ? 100 : calculateUnitProgress(steps),
      steps,
    };
  });
}

export function getLearningPathSummary(state: ProgressionState): {
  completedUnits: number;
  totalUnits: number;
  activeUnit: PathUnit | null;
} {
  const units = getLearningPath(state);
  const completedUnits = units.filter((unit) => unit.status === "complete").length;
  const activeUnit =
    units.find((unit) => unit.status === "in-progress") ??
    units.find((unit) => unit.status === "locked") ??
    null;

  return {
    completedUnits,
    totalUnits: units.length,
    activeUnit,
  };
}

export type TrainingPathCapstoneUnit = {
  id: DocumentTrackId;
  title: string;
  certificationId: CertificationId;
  certificationTitle: string;
  earned: boolean;
};

export function hasAllCapstoneCertifications(
  certifications: ProgressionState["certifications"]
): boolean {
  const earned = certifications ?? [];
  return UNIT_SEQUENCE.every((unit) =>
    earned.some((cert) => cert.id === unit.certificationId)
  );
}

export function isTrainingPathComplete(state: ProgressionState): boolean {
  return hasAllCapstoneCertifications(state.certifications);
}

export function getTrainingPathCapstoneStatus(state: ProgressionState): {
  complete: boolean;
  completedCount: number;
  totalCount: number;
  units: TrainingPathCapstoneUnit[];
  nextIncompleteUnit: TrainingPathCapstoneUnit | null;
} {
  const units = UNIT_SEQUENCE.map((unit) => {
    const certDefinition = CERTIFICATION_DEFINITIONS.find(
      (cert) => cert.id === unit.certificationId
    )!;

    return {
      id: unit.id,
      title: unit.title,
      certificationId: unit.certificationId,
      certificationTitle: certDefinition.title,
      earned: hasCertification(state, unit.certificationId),
    };
  });

  const completedCount = units.filter((unit) => unit.earned).length;

  return {
    complete: completedCount === units.length,
    completedCount,
    totalCount: units.length,
    units,
    nextIncompleteUnit: units.find((unit) => !unit.earned) ?? null,
  };
}

export type ContinueTrainingTarget = {
  unit: PathUnit;
  step: PathStep;
  href: string;
  headline: string;
  detail: string;
  allUnitsComplete: boolean;
};

function findNextStepInUnit(unit: PathUnit): PathStep | null {
  const inProgress = unit.steps.find((step) => step.status === "in-progress");
  if (inProgress) return inProgress;

  const available = unit.steps.find((step) => step.status === "available");
  if (available) return available;

  return (
    unit.steps.find(
      (step) => step.status !== "complete" && step.status !== "locked"
    ) ?? null
  );
}

function findFurthestIncompleteUnit(units: PathUnit[]): PathUnit | null {
  let targetUnit: PathUnit | null = null;

  for (const unit of units) {
    if (unit.status === "locked") break;
    if (unit.status === "complete") continue;
    targetUnit = unit;
  }

  return targetUnit;
}

export function getContinueTrainingTarget(
  state: ProgressionState
): ContinueTrainingTarget {
  const units = getLearningPath(state);
  const allUnitsComplete = units.every((unit) => unit.status === "complete");

  if (allUnitsComplete) {
    const finalUnit = units[units.length - 1]!;
    return {
      unit: finalUnit,
      step: finalUnit.steps[finalUnit.steps.length - 1]!,
      href: "/path",
      headline: "Training path complete",
      detail: "You have certified all three founding document units.",
      allUnitsComplete: true,
    };
  }

  const targetUnit =
    findFurthestIncompleteUnit(units) ?? units.find((unit) => unit.status !== "locked") ?? units[0]!;
  const step = findNextStepInUnit(targetUnit) ?? targetUnit.steps[0]!;

  return {
    unit: targetUnit,
    step,
    href: step.href,
    headline: `${step.label} · ${targetUnit.title}`,
    detail: step.progressLabel
      ? `${step.description} (${step.progressLabel})`
      : step.description,
    allUnitsComplete: false,
  };
}