import type { ProgressionState } from "@/lib/progression";
import { getRankForScore } from "@/lib/progression";

export type CertificationId =
  | "declaration-defender"
  | "constitution-guardian"
  | "bill-of-rights-sentinel"
  | "full-constitutional-defender";

export type CertificationRecord = {
  id: CertificationId;
  earnedAt: string;
  accuracy: number;
  scenariosCompleted: number;
  defenderScoreAtEarn: number;
};

export type CertificationAccent = "gold" | "blue" | "crimson";

export type CertificationDefinition = {
  id: CertificationId;
  title: string;
  subtitle: string;
  document: string;
  description: string;
  minScenarios: number;
  minAccuracy: number;
  minDefenderScore: number;
  bonusPoints: number;
  accent: CertificationAccent;
  sealLabel: string;
};

export type DocumentTrackId = "declaration" | "constitution" | "bill-of-rights";

export type CertificationProgress = {
  definition: CertificationDefinition;
  earned: boolean;
  record: CertificationRecord | null;
  eligible: boolean;
  overallProgress: number;
  requirements: {
    scenarios: { current: number; target: number; progress: number; met: boolean };
    accuracy: { current: number; target: number; progress: number; met: boolean };
    defenderScore: { current: number; target: number; progress: number; met: boolean };
    prerequisites?: { label: string; met: boolean }[];
  };
};

const DOCUMENT_MATCHERS: Record<
  DocumentTrackId,
  (label: string) => boolean
> = {
  declaration: (label) => label.startsWith("Declaration"),
  constitution: (label) =>
    label.startsWith("Constitution") ||
    label.startsWith("Article") ||
    label.startsWith("Art."),
  "bill-of-rights": (label) =>
    /^\d/.test(label) || label.includes("Amendment"),
};

export const CERTIFICATION_DEFINITIONS: CertificationDefinition[] = [
  {
    id: "declaration-defender",
    title: "Defender of the Declaration",
    subtitle: "Declaration of Independence",
    document: "Declaration of Independence",
    description:
      "Demonstrate mastery of natural rights, consent of the governed, and the Declaration's founding principles.",
    minScenarios: 8,
    minAccuracy: 80,
    minDefenderScore: 500,
    bonusPoints: 200,
    accent: "gold",
    sealLabel: "Declaration Certified",
  },
  {
    id: "constitution-guardian",
    title: "Guardian of the Constitution",
    subtitle: "U.S. Constitution",
    document: "U.S. Constitution",
    description:
      "Prove command of separated powers, enumerated authority, and the architecture of republican government.",
    minScenarios: 8,
    minAccuracy: 80,
    minDefenderScore: 1000,
    bonusPoints: 200,
    accent: "blue",
    sealLabel: "Constitution Certified",
  },
  {
    id: "bill-of-rights-sentinel",
    title: "Sentinel of the Bill of Rights",
    subtitle: "Bill of Rights",
    document: "Bill of Rights",
    description:
      "Show fluency in the first ten amendments — speech, search, due process, arms, and the limits on federal power.",
    minScenarios: 8,
    minAccuracy: 80,
    minDefenderScore: 1500,
    bonusPoints: 200,
    accent: "crimson",
    sealLabel: "Bill of Rights Certified",
  },
  {
    id: "full-constitutional-defender",
    title: "Full Constitutional Defender",
    subtitle: "All Founding Documents",
    document: "Declaration · Constitution · Bill of Rights",
    description:
      "Earn all three document certifications and maintain elite overall accuracy across the full curriculum.",
    minScenarios: 0,
    minAccuracy: 75,
    minDefenderScore: 3000,
    bonusPoints: 500,
    accent: "gold",
    sealLabel: "Full Defender Certified",
  },
];

const DOCUMENT_CERT_IDS: Record<DocumentTrackId, CertificationId> = {
  declaration: "declaration-defender",
  constitution: "constitution-guardian",
  "bill-of-rights": "bill-of-rights-sentinel",
};

export function getDocumentTrackStats(
  state: ProgressionState,
  trackId: DocumentTrackId
): { correct: number; total: number; accuracy: number } {
  const matcher = DOCUMENT_MATCHERS[trackId];
  const entries = Object.entries(state.weakAreas).filter(([label]) =>
    matcher(label)
  );

  const total = entries.reduce((sum, [, stats]) => sum + stats.total, 0);
  const correct = entries.reduce((sum, [, stats]) => sum + stats.correct, 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { correct, total, accuracy };
}

export function getOverallAccuracy(state: ProgressionState): number {
  const entries = Object.values(state.weakAreas);
  const total = entries.reduce((sum, stats) => sum + stats.total, 0);
  const correct = entries.reduce((sum, stats) => sum + stats.correct, 0);
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function requirementProgress(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
}

function hasCertification(
  state: ProgressionState,
  id: CertificationId
): CertificationRecord | null {
  return (state.certifications ?? []).find((cert) => cert.id === id) ?? null;
}

function isDocumentCertEligible(
  state: ProgressionState,
  definition: CertificationDefinition,
  trackId: DocumentTrackId
): { eligible: boolean; stats: ReturnType<typeof getDocumentTrackStats> } {
  const stats = getDocumentTrackStats(state, trackId);
  const eligible =
    stats.total >= definition.minScenarios &&
    stats.accuracy >= definition.minAccuracy &&
    state.defenderScore >= definition.minDefenderScore;

  return { eligible, stats };
}

function isFullCertEligible(state: ProgressionState): boolean {
  const definition = CERTIFICATION_DEFINITIONS.find(
    (cert) => cert.id === "full-constitutional-defender"
  )!;

  const docCerts = (
    ["declaration", "constitution", "bill-of-rights"] as DocumentTrackId[]
  ).every((trackId) => hasCertification(state, DOCUMENT_CERT_IDS[trackId]));

  const overallAccuracy = getOverallAccuracy(state);

  return (
    docCerts &&
    overallAccuracy >= definition.minAccuracy &&
    state.defenderScore >= definition.minDefenderScore
  );
}

export function getCertificationProgress(
  state: ProgressionState,
  definition: CertificationDefinition
): CertificationProgress {
  const record = hasCertification(state, definition.id);

  if (definition.id === "full-constitutional-defender") {
    const overallAccuracy = getOverallAccuracy(state);
    const totalAnswered = Object.values(state.weakAreas).reduce(
      (sum, stats) => sum + stats.total,
      0
    );
    const docPrereqs = (
      ["declaration", "constitution", "bill-of-rights"] as DocumentTrackId[]
    ).map((trackId) => {
      const certDef = CERTIFICATION_DEFINITIONS.find(
        (cert) => cert.id === DOCUMENT_CERT_IDS[trackId]
      )!;
      return {
        label: certDef.title,
        met: Boolean(hasCertification(state, DOCUMENT_CERT_IDS[trackId])),
      };
    });

    const accuracyReq = {
      current: overallAccuracy,
      target: definition.minAccuracy,
      progress: requirementProgress(overallAccuracy, definition.minAccuracy),
      met: overallAccuracy >= definition.minAccuracy,
    };
    const scoreReq = {
      current: state.defenderScore,
      target: definition.minDefenderScore,
      progress: requirementProgress(
        state.defenderScore,
        definition.minDefenderScore
      ),
      met: state.defenderScore >= definition.minDefenderScore,
    };
    const prereqMet = docPrereqs.every((item) => item.met);
    const eligible = prereqMet && accuracyReq.met && scoreReq.met;

    const progressValues = [
      prereqMet ? 100 : Math.round(
        (docPrereqs.filter((item) => item.met).length / docPrereqs.length) * 100
      ),
      accuracyReq.progress,
      scoreReq.progress,
    ];

    return {
      definition,
      earned: Boolean(record),
      record,
      eligible,
      overallProgress: record
        ? 100
        : Math.min(...progressValues),
      requirements: {
        scenarios: {
          current: totalAnswered,
          target: 0,
          progress: prereqMet ? 100 : Math.round(
            (docPrereqs.filter((item) => item.met).length / docPrereqs.length) *
              100
          ),
          met: prereqMet,
        },
        accuracy: accuracyReq,
        defenderScore: scoreReq,
        prerequisites: docPrereqs,
      },
    };
  }

  const trackId = (
    Object.entries(DOCUMENT_CERT_IDS) as [DocumentTrackId, CertificationId][]
  ).find(([, certId]) => certId === definition.id)?.[0]!;

  const { eligible, stats } = isDocumentCertEligible(
    state,
    definition,
    trackId
  );

  const scenariosReq = {
    current: stats.total,
    target: definition.minScenarios,
    progress: requirementProgress(stats.total, definition.minScenarios),
    met: stats.total >= definition.minScenarios,
  };
  const accuracyReq = {
    current: stats.accuracy,
    target: definition.minAccuracy,
    progress: requirementProgress(stats.accuracy, definition.minAccuracy),
    met: stats.accuracy >= definition.minAccuracy,
  };
  const scoreReq = {
    current: state.defenderScore,
    target: definition.minDefenderScore,
    progress: requirementProgress(
      state.defenderScore,
      definition.minDefenderScore
    ),
    met: state.defenderScore >= definition.minDefenderScore,
  };

  return {
    definition,
    earned: Boolean(record),
    record,
    eligible,
    overallProgress: record
      ? 100
      : Math.min(scenariosReq.progress, accuracyReq.progress, scoreReq.progress),
    requirements: {
      scenarios: scenariosReq,
      accuracy: accuracyReq,
      defenderScore: scoreReq,
    },
  };
}

export function getAllCertificationProgress(
  state: ProgressionState
): CertificationProgress[] {
  return CERTIFICATION_DEFINITIONS.map((definition) =>
    getCertificationProgress(state, definition)
  );
}

export function getEarnedCertificationCount(state: ProgressionState): number {
  return state.certifications?.length ?? 0;
}

function buildCertificationRecord(
  state: ProgressionState,
  definition: CertificationDefinition
): CertificationRecord {
  if (definition.id === "full-constitutional-defender") {
    return {
      id: definition.id,
      earnedAt: new Date().toISOString(),
      accuracy: getOverallAccuracy(state),
      scenariosCompleted: Object.values(state.weakAreas).reduce(
        (sum, stats) => sum + stats.total,
        0
      ),
      defenderScoreAtEarn: state.defenderScore,
    };
  }

  const trackId = (
    Object.entries(DOCUMENT_CERT_IDS) as [DocumentTrackId, CertificationId][]
  ).find(([, certId]) => certId === definition.id)?.[0]!;
  const stats = getDocumentTrackStats(state, trackId);

  return {
    id: definition.id,
    earnedAt: new Date().toISOString(),
    accuracy: stats.accuracy,
    scenariosCompleted: stats.total,
    defenderScoreAtEarn: state.defenderScore,
  };
}

export function checkAndAwardCertifications(state: ProgressionState): {
  state: ProgressionState;
  newlyAwarded: CertificationId[];
  bonusPoints: number;
} {
  const existing = new Set((state.certifications ?? []).map((cert) => cert.id));
  const newlyAwarded: CertificationId[] = [];
  let bonusPoints = 0;
  let certifications = [...(state.certifications ?? [])];
  let defenderScore = state.defenderScore;
  let lastRankId = state.lastRankId;
  let pendingPromotionCommentary = state.pendingPromotionCommentary;

  const previousRank = getRankForScore(defenderScore);

  for (const definition of CERTIFICATION_DEFINITIONS) {
    if (existing.has(definition.id)) continue;

    const progress = getCertificationProgress(
      { ...state, defenderScore, certifications },
      definition
    );

    if (!progress.eligible) continue;

    const record = buildCertificationRecord(
      { ...state, defenderScore, certifications },
      definition
    );

    certifications.push(record);
    existing.add(definition.id);
    newlyAwarded.push(definition.id);
    bonusPoints += definition.bonusPoints;
    defenderScore += definition.bonusPoints;
  }

  const newRank = getRankForScore(defenderScore);
  if (newRank.id !== previousRank.id) {
    lastRankId = newRank.id;
    pendingPromotionCommentary = newRank.id;
  }

  if (newlyAwarded.length === 0) {
    return { state, newlyAwarded, bonusPoints: 0 };
  }

  return {
    state: {
      ...state,
      certifications,
      defenderScore,
      lastRankId,
      pendingPromotionCommentary,
    },
    newlyAwarded,
    bonusPoints,
  };
}

export function mergeCertifications(
  local: CertificationRecord[] | undefined,
  remote: CertificationRecord[] | undefined
): CertificationRecord[] {
  const map = new Map<CertificationId, CertificationRecord>();

  for (const cert of remote ?? []) {
    map.set(cert.id, cert);
  }

  for (const cert of local ?? []) {
    const existing = map.get(cert.id);
    if (!existing || cert.earnedAt < existing.earnedAt) {
      map.set(cert.id, cert);
    }
  }

  return [...map.values()].sort((a, b) => a.earnedAt.localeCompare(b.earnedAt));
}

export function getCertificationDefinition(
  id: CertificationId
): CertificationDefinition {
  return (
    CERTIFICATION_DEFINITIONS.find((cert) => cert.id === id) ??
    CERTIFICATION_DEFINITIONS[0]
  );
}