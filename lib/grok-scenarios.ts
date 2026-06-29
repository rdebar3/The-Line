import { getDocumentCorpusForPrompt } from "@/lib/document-corpus";
import {
  QUESTION_FORMAT_PROMPTS,
  type QuestionFormat,
} from "@/lib/question-formats";
import type { TopicAssignment } from "@/lib/scenario-curriculum";
import { getCurriculumOverview } from "@/lib/scenario-curriculum";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";
import { shuffleScenarioChoices } from "@/lib/choice-shuffle";
import type { Scenario } from "@/lib/scenarios";
import { CHARACTER_NAME } from "@/lib/guardian";

export type GrokScenarioRequest = {
  difficulty: ScenarioDifficulty;
  rankTitle: string;
  rankAbbreviation: string;
  sessionSize: number;
  performanceSummary: string;
  weakAreas: string[];
  isPremium: boolean;
  previousScenarioIds?: string[];
  previousScenarioTitles?: string[];
  recentTopicIds?: string[];
  topicAssignments?: TopicAssignment[];
  sessionSeed?: number;
};

const BASE_CONTEXT = `You are No Face Patriot, training officer for "The Line" — a civic education platform for the founding documents.

Your job is to TEACH citizens the Declaration, Constitution, Bill of Rights, and core principles — not to write legal fiction.

PRIMARY GOAL: High-quality questions that help users understand the documents and apply that knowledge in real life.

Speak as ${CHARACTER_NAME} in guardianPositive/guardianNegative — direct, principled, motivating. Never partisan, never jokey, never mention AI.

QUALITY BAR (non-negotiable):
- Teach the assigned founding source accurately — ground content in lib/documents/.
- Four distinct multiple-choice answers; exactly one best answer.
- Wrong answers must reflect common citizen misconceptions — not absurd trick options.
- historicalContext: tie to the actual founding text (quote or paraphrase the passage when relevant).
- modernImplication: MUST give practical value — how this protects or guides the user in everyday civic life (rights, government limits, voting, speech, courts, property, etc.).
- guardianPositive/guardianNegative: 1–2 crisp sentences of coaching.

ANTI-PATTERNS (never do these):
- Forced, contrived scenarios that stretch a doctrine onto unrelated facts (e.g., data brokers + soldier quartering for Third Amendment).
- Using the Preamble as an operational legal answer when a specific Amendment or Article governs.
- Six-sentence legal thrillers when a direct teaching question would work better.
- Bizarre tech dystopia plots to make rare amendments "relevant."
- Distractors that no reasonable person would consider (obvious throwaways).
- Questions where the "correct" answer requires a tortured analogy instead of straightforward doctrine.

MULTIPLE-CHOICE DESIGN (standard test quality):
- Vary which choice letter is correct across a session — never default every answer to "a".
- All four options should be similar in length, tone, and specificity; the correct answer must not stand out as the longest or most legalistic.
- Distractors must be plausible misconceptions a thoughtful citizen might pick — never joke options, "all of the above," or obvious throwaways.
- When generating multiple items, rotate correctChoiceId across a, b, c, and d roughly evenly.

NOT every item is a dramatic scenario. Follow the assigned questionFormat exactly.`;

const DIFFICULTY_RULES: Record<ScenarioDifficulty, string> = {
  easy: `DIFFICULTY TIER: FOUNDATIONAL (Private through Sergeant)
- Prefer "passage" and "teach" formats — help users read and understand the documents.
- "apply" only when the everyday situation fits naturally in 2–3 sentences.
- Avoid "scenario" format unless the dispute is obvious and simple.
- One clear idea per question. Plain language.`,
  medium: `DIFFICULTY TIER: FIELD GRADE (Staff Sergeant & Master Sergeant)
- Mix teach, apply, and passage formats. Scenario format only when realistic.
- Questions may ask which principle MOST directly applies — but still one best answer.
- Distractors should be legally plausible misconceptions.`,
  hard: `DIFFICULTY TIER: COMMAND LEVEL (Lieutenant+)
- May use apply and scenario formats with more nuance; multi-document assignments require integrating sources clearly.
- Still forbid contrived fact patterns — quality over cleverness.
- modernImplication should address complex real-world stakes (federalism, due process, speech, surveillance) without partisan framing.`,
};

export function getScenarioGenerationSystemPrompt(
  difficulty: ScenarioDifficulty
): string {
  return `${BASE_CONTEXT}

${DIFFICULTY_RULES[difficulty]}

QUESTION FORMATS (follow the assigned format for each item):
${Object.entries(QUESTION_FORMAT_PROMPTS)
  .map(([format, rules]) => `--- ${format.toUpperCase()} ---\n${rules}`)
  .join("\n\n")}

CURRICULUM TOPICS (assignment targets):
${getCurriculumOverview()}

AUTHORITATIVE DOCUMENT CORPUS (lib/documents — ground all content here):
${getDocumentCorpusForPrompt()}

Respond ONLY with valid JSON:
{
  "scenarios": [
    {
      "id": "unique-kebab-case-slug",
      "questionFormat": "passage | teach | apply | scenario",
      "sourceDocument": "must match assignment",
      "amendment": "Declaration | Preamble | Art. I | 4th | Principle | Multi",
      "amendmentLabel": "human-readable source label",
      "title": "Short, clear title (not clickbait)",
      "situation": "Content per questionFormat rules above",
      "question": "Clear multiple-choice question",
      "choices": [
        { "id": "a", "label": "..." },
        { "id": "b", "label": "..." },
        { "id": "c", "label": "..." },
        { "id": "d", "label": "..." }
      ],
      "correctChoiceId": "b",
      "historicalContext": "2-4 sentences tied to founding text",
      "modernImplication": "2-4 sentences of practical value for the user's life",
      "guardianPositive": "1-2 sentences",
      "guardianNegative": "1-2 sentences",
      "passageIds": ["passage-id-from-corpus-if-applicable"],
      "rememberLine": "One sentence the user should remember after a wrong answer"
    }
  ]
}

Output rules:
- Generate EXACTLY the requested count.
- Follow each TOPIC ASSIGNMENT including questionFormat — this overrides default instincts.
- questionFormat in output must match assignment.
- JSON only. No markdown.
- correctChoiceId must vary across items — use b, c, or d as often as a.`;
}

function formatTopicAssignments(assignments: TopicAssignment[]): string {
  return assignments
    .map((assignment, index) => {
      const formatRules =
        QUESTION_FORMAT_PROMPTS[assignment.questionFormat] ?? "";

      return `Item ${index + 1}:
  - Topic ID: ${assignment.topicId}
  - Focus: ${assignment.label}
  - Source document: ${assignment.sourceDocument}
  - Source label: ${assignment.amendment} / ${assignment.amendmentLabel}
  - Principles: ${assignment.principles.join(", ")}
  - REQUIRED questionFormat: ${assignment.questionFormat}
  - Format instructions: ${formatRules.replace(/\n/g, " ")}
  - Multi-document: ${assignment.isMultiDocument ? "YES" : "no"}
  - Setting note: ${assignment.settingHint}
  - Passage IDs (cite in historicalContext): ${assignment.passageIds?.join(", ") ?? "derive from source"}`;
    })
    .join("\n\n");
}

export function buildScenarioGenerationUserPrompt(
  request: GrokScenarioRequest
): string {
  const weak =
    request.weakAreas.length > 0
      ? request.weakAreas.join(", ")
      : "Rotate broadly across the full curriculum.";

  const avoidIds =
    request.previousScenarioIds && request.previousScenarioIds.length > 0
      ? request.previousScenarioIds.slice(-20).join(", ")
      : "none";

  const avoidTitles =
    request.previousScenarioTitles && request.previousScenarioTitles.length > 0
      ? request.previousScenarioTitles.slice(-20).join(" | ")
      : "none";

  const avoidTopics =
    request.recentTopicIds && request.recentTopicIds.length > 0
      ? request.recentTopicIds.slice(-15).join(", ")
      : "none";

  const assignments =
    request.topicAssignments && request.topicAssignments.length > 0
      ? formatTopicAssignments(request.topicAssignments)
      : "No assignments — use teach or passage format from varied founding sources.";

  const personalization = request.isPremium
    ? "PREMIUM: Personalize to weak areas while honoring format and source assignments."
    : "FREE: Same teaching quality required.";

  return [
    `MISSION: Generate exactly ${request.sessionSize} high-quality civic training item(s). Teach the documents — do not write contrived legal fiction.`,
    `Defender rank: ${request.rankTitle} (${request.rankAbbreviation})`,
    `Difficulty tier: ${request.difficulty.toUpperCase()}`,
    personalization,
    `ASSIGNMENTS (mandatory — follow questionFormat for each):\n${assignments}`,
    `Weak areas to emphasize when compatible: ${weak}`,
    `Performance intel:\n${request.performanceSummary}`,
    `BANNED IDs/patterns: ${avoidIds}`,
    `BANNED titles (do not paraphrase): ${avoidTitles}`,
    `Recent topic IDs (use different angles): ${avoidTopics}`,
    `FINAL CHECK: Would a citizen learn something useful about the founding documents from this question? If the fact pattern feels forced or absurd, discard it and write a direct teach or passage question instead.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function isValidScenario(candidate: Partial<Scenario>): candidate is Scenario {
  return Boolean(
    candidate.id &&
      candidate.amendment &&
      candidate.amendmentLabel &&
      candidate.title &&
      candidate.situation &&
      candidate.question &&
      Array.isArray(candidate.choices) &&
      candidate.choices.length >= 4 &&
      candidate.correctChoiceId &&
      candidate.historicalContext &&
      candidate.modernImplication &&
      candidate.guardianPositive &&
      candidate.guardianNegative &&
      candidate.choices.some((choice) => choice.id === candidate.correctChoiceId)
  );
}

function normalizeScenarioId(id: string, index: number, seed: number): string {
  const base = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${seed}-${index}`;
}

const VALID_FORMATS = new Set<QuestionFormat>([
  "passage",
  "teach",
  "apply",
  "scenario",
]);

export function parseGrokScenariosPayload(
  content: string,
  difficulty: ScenarioDifficulty,
  sessionSeed = Date.now()
): Scenario[] {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      scenarios?: Partial<Scenario>[];
    };

    if (!Array.isArray(parsed.scenarios)) return [];

    return parsed.scenarios
      .filter(isValidScenario)
      .map((scenario, index) => {
        const normalized: Scenario = {
          ...scenario,
          id: normalizeScenarioId(scenario.id, index, sessionSeed),
          questionFormat:
            scenario.questionFormat &&
            VALID_FORMATS.has(scenario.questionFormat as QuestionFormat)
              ? (scenario.questionFormat as QuestionFormat)
              : undefined,
          difficulty,
          generated: true,
        };
        return shuffleScenarioChoices(normalized);
      });
  } catch {
    return [];
  }
}