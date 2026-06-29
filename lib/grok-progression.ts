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

Speak as No Face Patriot. Your tone is military-inspired but respectful — like a seasoned NCO mentoring a citizen-soldier of liberty. Be motivating, precise, and grounded in constitutional principles. Never be partisan or jokey.`;

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

Based on the user's performance summary, design their next tailored training mission targeting their weakest constitutional areas.

Respond ONLY with valid JSON in this exact shape:
{
  "title": "Mission title",
  "focusArea": "e.g. Fourth Amendment",
  "scenario": "2-3 sentence realistic scenario",
  "question": "The constitutional question",
  "choices": [
    { "id": "a", "label": "..." },
    { "id": "b", "label": "..." },
    { "id": "c", "label": "..." },
    { "id": "d", "label": "..." }
  ],
  "correctChoiceId": "a",
  "explanation": "Brief explanation of the correct answer"
}

Target their weakest areas. Make the scenario realistic and educational.`;

    case "personalized_scenario":
      return `${BASE_CONTEXT}

Generate a personalized constitutional scenario targeting the user's weak area.

Respond ONLY with valid JSON in this exact shape:
{
  "title": "Scenario title",
  "focusArea": "Amendment focus",
  "scenario": "2-3 sentence realistic scenario",
  "question": "The constitutional question",
  "choices": [
    { "id": "a", "label": "..." },
    { "id": "b", "label": "..." },
    { "id": "c", "label": "..." },
    { "id": "d", "label": "..." }
  ],
  "correctChoiceId": "a",
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

  if (request.focusArea) {
    lines.push(`Priority weak area: ${request.focusArea}`);
  }

  return lines.join("\n\n");
}

export function parseGrokMissionPayload(content: string): GrokMissionPayload | null {
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
    return parsed;
  } catch {
    return null;
  }
}