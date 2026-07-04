export type LivingOathTier = 0 | 1 | 2 | 3 | 4 | 5;

export type LivingOathEvolution = {
  tier: LivingOathTier;
  tierLabel: string;
  tierDescription: string;
  glowIntensity: number;
  bloomStrength: number;
  cloakFlow: number;
  cloakOpacity: number;
  scrollCount: number;
  sealCount: number;
  battleMarks: number;
  auraRadius: number;
  armorEmissive: number;
  hasTricornPlume: boolean;
  hasShoulderArmor: boolean;
  progressPercent: number;
};

const TIER_LABELS: Record<LivingOathTier, { label: string; description: string }> =
  {
    0: {
      label: "Oath Kindled",
      description: "Your beacon awakens — the standard is set.",
    },
    1: {
      label: "Sentinel Rising",
      description: "First light breaks through — training has begun.",
    },
    2: {
      label: "Cloak of Liberty",
      description: "Your flag cloak flows — Lines and drills take hold.",
    },
    3: {
      label: "Seal of the Republic",
      description: "Gold seals form — credentials earned, oath deepens.",
    },
    4: {
      label: "Battle-Hardened",
      description: "Honorable marks appear — streak and score burn bright.",
    },
    5: {
      label: "Living Legend",
      description: "Full radiance — a defender the founders would recognize.",
    },
  };

export type LivingOathInputs = {
  defenderScore: number;
  savedLinesCount: number;
  certificationsEarned: number;
  dailyStreak: number;
  longestStreak: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function computeLivingOathEvolution(
  inputs: LivingOathInputs
): LivingOathEvolution {
  const {
    defenderScore,
    savedLinesCount,
    certificationsEarned,
    dailyStreak,
    longestStreak,
  } = inputs;

  const scoreFactor = clamp01(defenderScore / 5000);
  const linesFactor = clamp01(savedLinesCount / 12);
  const certFactor = clamp01(certificationsEarned / 4);
  const streakFactor = clamp01(Math.max(dailyStreak, longestStreak) / 14);

  const composite =
    scoreFactor * 0.45 +
    linesFactor * 0.2 +
    certFactor * 0.25 +
    streakFactor * 0.1;

  let tier: LivingOathTier = 0;
  if (composite >= 0.88 && defenderScore >= 4000 && certificationsEarned >= 3) {
    tier = 5;
  } else if (composite >= 0.72 && defenderScore >= 2500) {
    tier = 4;
  } else if (composite >= 0.55 && certificationsEarned >= 1) {
    tier = 3;
  } else if (composite >= 0.38 && (savedLinesCount >= 3 || defenderScore >= 800)) {
    tier = 2;
  } else if (composite >= 0.15 || defenderScore >= 100) {
    tier = 1;
  }

  const tierMeta = TIER_LABELS[tier];
  const tierScale = tier / 5;

  return {
    tier,
    tierLabel: tierMeta.label,
    tierDescription: tierMeta.description,
    glowIntensity: 0.35 + tierScale * 1.65 + composite * 0.4,
    bloomStrength: 0.45 + tierScale * 1.1,
    cloakFlow: 0.4 + tierScale * 0.9,
    cloakOpacity: 0.55 + tierScale * 0.35,
    scrollCount: tier >= 2 ? Math.min(3, 1 + Math.floor(linesFactor * 3)) : 0,
    sealCount: tier >= 3 ? Math.min(3, certificationsEarned) : tier >= 1 ? 1 : 0,
    battleMarks: tier >= 4 ? 3 + Math.floor(streakFactor * 3) : tier >= 2 ? 1 : 0,
    auraRadius: 0.9 + tierScale * 1.4,
    armorEmissive: 0.08 + tierScale * 0.45,
    hasTricornPlume: tier >= 3,
    hasShoulderArmor: tier >= 2,
    progressPercent: Math.round(composite * 100),
  };
}