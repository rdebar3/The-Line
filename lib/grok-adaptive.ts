import { shuffleMissionChoices } from "@/lib/choice-shuffle";
import { getDocumentCorpusForPrompt } from "@/lib/document-corpus";
import { CHARACTER_NAME } from "@/lib/guardian";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";

export type AdaptiveMissionGenerateRequest = {
  performanceSummary: string;
  focusAreas: string[];
  weakAreas: { label: string; accuracy: number }[];
  rankTitle: string;
  rankAbbreviation: string;
  difficulty: ScenarioDifficulty;
  scenarioCount: number;
  isPremium: boolean;
};

export type AdaptiveMissionScenarioPayload = {
  title: string;
  focusArea: string;
  topicId: string;
  sourceDocument: string;
  scenario: string;
  question: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
  difficultyLevel: number;
};

export type AdaptiveMissionBatchPayload = {
  missionTitle: string;
  focusAreas: string[];
  scenarios: AdaptiveMissionScenarioPayload[];
};

export type AdaptiveDebriefRequest = {
  performanceSummary: string;
  focusAreas: string[];
  results: { focusArea: string; correct: boolean }[];
  correctCount: number;
  totalCount: number;
};

const BASE_CONTEXT = `You are ${CHARACTER_NAME}, the Tactical Training Officer for "The Line" — a civic defense education platform.

Speak as ${CHARACTER_NAME}: military-inspired, respectful, motivating, constitutionally grounded. Never partisan. Never mention AI.

Use the full founding corpus: Declaration of Independence, U.S. Constitution, Bill of Rights, and core constitutional principles.

READABILITY: Write at a high school civics reading level. Short sentences, plain English, no legal jargon. Questions and choices must be clear on the first read. All four options similar length; correct answer wins by being right, not by being the longest or most technical.`;

const DIFFICULTY_GUIDANCE: Record<ScenarioDifficulty, string> = {
  easy: "Foundational tier — clear teaching questions, plain language, one doctrine per scenario.",
  medium: "Field grade — realistic applications with plausible distractors.",
  hard: "Command level — nuanced multi-principle analysis without contrived plots.",
};

export function getAdaptiveMissionSystemPrompt(
  scenarioCount: number,
  isPremium: boolean
): string {
  return `${BASE_CONTEXT}

Design a PERSONALIZED WEAK-AREA TRAINING MISSION with exactly ${scenarioCount} progressive scenarios.

MISSION DESIGN RULES:
- Target the user's weakest constitutional areas first, then reinforce related principles.
- Each scenario must increase slightly in difficulty (difficultyLevel 1 → ${scenarioCount}).
- Draw from Declaration, Constitution, Bill of Rights, and core principles — assign accurate sourceDocument.
- ${isPremium ? "PREMIUM: Deeper cross-document synthesis and sharper real-world applications." : "FREE TIER: Focused, high-quality foundational drills on priority weak areas."}
- ${DIFFICULTY_GUIDANCE.easy}
- ${DIFFICULTY_GUIDANCE.medium}
- ${DIFFICULTY_GUIDANCE.hard}

MULTIPLE-CHOICE QUALITY:
- Exactly 4 choices (a, b, c, d); one best answer.
- Rotate correctChoiceId across letters — do not default to "a".
- Distractors = plausible citizen misconceptions.

Respond ONLY with valid JSON:
{
  "missionTitle": "Mission name referencing weak areas",
  "focusAreas": ["Area 1", "Area 2"],
  "scenarios": [
    {
      "title": "Scenario title",
      "focusArea": "Fourth Amendment",
      "topicId": "4th-amendment",
      "sourceDocument": "Bill of Rights — Fourth Amendment",
      "scenario": "2-4 short sentences — plain English situation or teaching setup",
      "question": "Clear question a high school student can answer",
      "choices": [
        { "id": "a", "label": "..." },
        { "id": "b", "label": "..." },
        { "id": "c", "label": "..." },
        { "id": "d", "label": "..." }
      ],
      "correctChoiceId": "b",
      "explanation": "Brief explanation tied to founding text",
      "difficultyLevel": 1
    }
  ]
}

topicId must be one of: 4th-amendment, consent-governed, due-process, free-speech, separation-powers, natural-rights, federalism, equal-protection.

${getDocumentCorpusForPrompt()}`;
}

export function buildAdaptiveMissionUserPrompt(
  request: AdaptiveMissionGenerateRequest
): string {
  const weakLines =
    request.weakAreas.length > 0
      ? request.weakAreas
          .map((area) => `- ${area.label}: ${area.accuracy}% accuracy`)
          .join("\n")
      : "- No performance history yet — assign balanced foundational mission.";

  return [
    `Performance intelligence:\n${request.performanceSummary}`,
    `Rank: ${request.rankTitle} (${request.rankAbbreviation})`,
    `Training difficulty tier: ${request.difficulty}`,
    `Priority focus areas: ${request.focusAreas.join(", ")}`,
    `Weak-area breakdown:\n${weakLines}`,
    `Generate exactly ${request.scenarioCount} progressively harder scenarios.`,
  ].join("\n\n");
}

export function getAdaptiveDebriefSystemPrompt(): string {
  return `${BASE_CONTEXT}

The user just completed a personalized weak-area training mission. Write a brief intelligence debrief (2-3 paragraphs) that:
- Acknowledges specific focus areas they trained on
- Notes where they showed improvement or need more reps (based on their results)
- Uses encouraging NCO tone — e.g. "You've strengthened your understanding of the 4th Amendment significantly"
- Ends with a crisp call to keep training

Do not use markdown headers. Write in second person.`;
}

export function buildAdaptiveDebriefUserPrompt(
  request: AdaptiveDebriefRequest
): string {
  const resultLines = request.results
    .map(
      (result) =>
        `${result.focusArea}: ${result.correct ? "correct" : "needs reinforcement"}`
    )
    .join("\n");

  return [
    `Mission focus areas: ${request.focusAreas.join(", ")}`,
    `Mission score: ${request.correctCount}/${request.totalCount} correct`,
    `Scenario results:\n${resultLines}`,
    `Performance context:\n${request.performanceSummary}`,
  ].join("\n\n");
}

export function parseAdaptiveMissionBatch(
  content: string,
  expectedCount: number
): AdaptiveMissionBatchPayload | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as AdaptiveMissionBatchPayload;

    if (
      !parsed.missionTitle ||
      !Array.isArray(parsed.scenarios) ||
      parsed.scenarios.length < 1
    ) {
      return null;
    }

    const scenarios = parsed.scenarios
      .slice(0, expectedCount)
      .map((scenario, index) => {
        const missionId = `adaptive-${Date.now()}-${index}`;
        const shuffled = shuffleMissionChoices(
          {
            title: scenario.title,
            focusArea: scenario.focusArea,
            scenario: scenario.scenario,
            question: scenario.question,
            choices: scenario.choices,
            correctChoiceId: scenario.correctChoiceId,
            explanation: scenario.explanation,
          },
          missionId
        );

        return {
          title: shuffled.title,
          focusArea: shuffled.focusArea || scenario.focusArea,
          topicId: scenario.topicId || "consent-governed",
          sourceDocument:
            scenario.sourceDocument || "U.S. Constitution & Founding Documents",
          scenario: shuffled.scenario,
          question: shuffled.question,
          choices: shuffled.choices,
          correctChoiceId: shuffled.correctChoiceId,
          explanation: shuffled.explanation,
          difficultyLevel: scenario.difficultyLevel ?? index + 1,
        };
      });

    return {
      missionTitle: parsed.missionTitle,
      focusAreas:
        parsed.focusAreas?.length > 0
          ? parsed.focusAreas
          : scenarios.map((s) => s.focusArea),
      scenarios,
    };
  } catch {
    return null;
  }
}