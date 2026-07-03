export type GrokProgressionAction =
  | "promotion_commentary"
  | "next_mission"
  | "personalized_scenario";

export type GrokProgressionRequest = {
  action: GrokProgressionAction;
  performanceSummary: string;
  rankTitle?: string;
  rankAbbreviation?: string;
  focusArea?: string;
};

export type WeakestDrillTarget = {
  focusArea: string;
  displayLabel: string;
  accuracy: number;
};

import { getIntelligenceReport } from "@/lib/adaptive-intelligence";
import { shuffleMissionChoices } from "@/lib/choice-shuffle";
import { getWeakAreas, type ProgressionState } from "@/lib/progression";

export type GrokMissionPayload = {
  title: string;
  focusArea: string;
  scenario: string;
  question: string;
  choices: { id: string; label: string }[];
  correctChoiceId: string;
  explanation: string;
};

const BASE_CONTEXT = `You are No Face Patriot, the Tactical Training Officer for "The Line," a civic defense education platform focused on constitutional rights and the Bill of Rights.

Speak as No Face Patriot. Your tone is military-inspired but respectful — like a seasoned NCO mentoring a citizen-soldier of liberty. Be motivating, precise, and grounded in constitutional principles. Never be partisan or jokey.

READABILITY: Write at a high school civics reading level. Short sentences, plain English, no legal jargon. Questions and choices must be easy to understand on the first read. All four options similar length; correct answer wins by being right, not by being the longest.`;

export function getProgressionSystemPrompt(action: GrokProgressionAction): string {
  switch (action) {
    case "promotion_commentary":
      return `${BASE_CONTEXT}

The user has earned a rank promotion in the Defender Score progression system. Write a short promotion ceremony address (2-3 paragraphs) that:
- Names their new rank with pride
- References their dedication to defending constitutional rights
- Gives one specific encouragement based on their performance summary
- Ends with a crisp, motivating call to continue training

Do not use markdown headers. Write in second person ("you").`;

    case "next_mission":
      return `${BASE_CONTEXT}

Design a GENERAL training mission — not a weak-area remedial drill. Pick a fresh constitutional topic at random across the Declaration of Independence, U.S. Constitution, Bill of Rights, and core founding principles. Vary topics between missions; do not repeat the user's weakest areas by default.

Respond ONLY with valid JSON in this exact shape:
{
  "title": "Mission title",
  "focusArea": "e.g. Fourth Amendment",
  "scenario": "2-3 short sentences — plain English, realistic situation",
  "question": "Clear question a high school student can answer",
  "choices": [
    { "id": "a", "label": "..." },
    { "id": "b", "label": "..." },
    { "id": "c", "label": "..." },
    { "id": "d", "label": "..." }
  ],
  "correctChoiceId": "b",
  "explanation": "Brief explanation of the correct answer"
}

Make the scenario realistic and educational. The focusArea field should name the topic you chose (not necessarily a weak area).

MULTIPLE-CHOICE DESIGN:
- Vary correctChoiceId across a, b, c, and d — do not always use "a".
- All options similar length and tone; distractors must be plausible misconceptions.`;

    case "personalized_scenario":
      return `${BASE_CONTEXT}

Generate a WEAK AREA REMEDIAL DRILL. The user prompt names their lowest-accuracy topic — focus EXCLUSIVELY on that area. Every part of the scenario, question, distractors, and explanation must drill that specific constitutional topic.

Respond ONLY with valid JSON in this exact shape:
{
  "title": "Scenario title",
  "focusArea": "Amendment focus",
  "scenario": "2-3 short sentences — plain English, realistic situation",
  "question": "Clear question a high school student can answer",
  "choices": [
    { "id": "a", "label": "..." },
    { "id": "b", "label": "..." },
    { "id": "c", "label": "..." },
    { "id": "d", "label": "..." }
  ],
  "correctChoiceId": "c",
  "explanation": "Brief explanation"
}`;

    default:
      return BASE_CONTEXT;
  }
}

export function buildProgressionUserPrompt(
  request: GrokProgressionRequest
): string {
  const lines = [`Performance summary:\n${request.performanceSummary}`];

  if (request.rankTitle) {
    lines.push(`New rank: ${request.rankTitle} (${request.rankAbbreviation})`);
  }

  if (request.action === "next_mission") {
    lines.push(
      "Mission type: GENERAL TRAINING — select a varied constitutional topic for broad practice. Do not target weak areas."
    );
  }

  if (request.action === "personalized_scenario") {
    if (request.focusArea) {
      lines.push(
        `Mission type: WEAK AREA DRILL — focus EXCLUSIVELY on: ${request.focusArea}`
      );
      lines.push(
        `The focusArea field in your JSON must be "${request.focusArea}" (or a clear variant of this label).`
      );
    } else {
      lines.push(
        "Mission type: WEAK AREA DRILL — no specific weak area provided; choose the most foundational gap from the performance summary."
      );
    }
  }

  return lines.join("\n\n");
}

export function getWeakestDrillTarget(
  state: ProgressionState
): WeakestDrillTarget | null {
  const weakAreas = getWeakAreas(state.weakAreas);
  if (weakAreas.length > 0) {
    const weakest = weakAreas[0]!;
    return {
      focusArea: weakest.amendment,
      displayLabel: weakest.amendment,
      accuracy: Math.round(weakest.accuracy * 100),
    };
  }

  const report = getIntelligenceReport(state);
  if (report.weakAreas.length > 0) {
    const weakest = report.weakAreas[0]!;
    return {
      focusArea: weakest.label,
      displayLabel: weakest.label,
      accuracy: weakest.accuracy,
    };
  }

  return null;
}

export function parseGrokMissionPayload(
  content: string,
  missionId = `mission-${Date.now()}`
): GrokMissionPayload | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as GrokMissionPayload;
    if (
      !parsed.title ||
      !parsed.scenario ||
      !parsed.question ||
      !Array.isArray(parsed.choices) ||
      parsed.choices.length < 2 ||
      !parsed.correctChoiceId
    ) {
      return null;
    }
    return shuffleMissionChoices(parsed, missionId);
  } catch {
    return null;
  }
}