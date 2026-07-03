import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";

/** How the training item presents its prompt — not every item is a dramatic scenario. */
export type QuestionFormat = "passage" | "teach" | "apply" | "scenario";

export const QUESTION_FORMAT_LABELS: Record<QuestionFormat, string> = {
  passage: "From the Text",
  teach: "Key Idea",
  apply: "Real-World Application",
  scenario: "Case Study",
};

/** Topics that should be taught directly — not forced into contrived modern plots. */
export const TEACH_FIRST_TOPIC_IDS = new Set([
  "3rd-quartering",
  "7th-civil-jury",
  "9th-unenumerated",
  "article-v-amendment",
  "declaration-separation",
  "preamble-union",
]);

const EASY_FORMAT_ROTATION: QuestionFormat[] = [
  "passage",
  "teach",
  "apply",
  "teach",
  "passage",
  "apply",
  "teach",
];

const MEDIUM_FORMAT_ROTATION: QuestionFormat[] = [
  "teach",
  "apply",
  "passage",
  "apply",
  "teach",
  "scenario",
  "apply",
];

const HARD_FORMAT_ROTATION: QuestionFormat[] = [
  "apply",
  "scenario",
  "teach",
  "apply",
  "passage",
  "apply",
];

export function pickQuestionFormat(
  difficulty: ScenarioDifficulty,
  scenarioIndexInSession: number,
  topicId: string
): QuestionFormat {
  const rotation =
    difficulty === "easy"
      ? EASY_FORMAT_ROTATION
      : difficulty === "medium"
        ? MEDIUM_FORMAT_ROTATION
        : HARD_FORMAT_ROTATION;

  let format = rotation[scenarioIndexInSession % rotation.length];

  if (TEACH_FIRST_TOPIC_IDS.has(topicId) && format === "scenario") {
    format = scenarioIndexInSession % 2 === 0 ? "passage" : "teach";
  }

  if (difficulty === "easy" && format === "scenario") {
    format = "teach";
  }

  return format;
}

export const QUESTION_FORMAT_PROMPTS: Record<QuestionFormat, string> = {
  passage: `FORMAT: FROM THE TEXT
- situation: Quote or closely paraphrase 1–2 sentences from the assigned founding passage (lib/documents), then ONE plain sentence of context. No fictional plot. High-school reading level.
- question: Ask in plain English what the text means, what it limits, what right it names, or why the Framers included it.
- choices: Test comprehension of the actual document — short, parallel options; no legal jargon.
- modernImplication: One concrete way this text still protects or guides citizens today.`,
  teach: `FORMAT: KEY IDEA (direct teaching)
- situation: 2–3 short sentences explaining the assigned topic — like a brief civics lesson, NOT a legal thriller or tech dystopia.
- question: Straightforward — "What does this rule do?", "Who is limited?", "What is the main idea?"
- choices: Each distractor reflects a common misconception. All four options similar length and tone — no throwaway answers, no jargon.
- modernImplication: Practical takeaway for engaging government, voting, or defending rights.`,
  apply: `FORMAT: REAL-WORLD APPLICATION
- situation: 2–4 short sentences describing ONE everyday situation Americans actually face (search, speech, voting, taxes, permits, courts). The right must fit naturally — no Rube Goldberg fact chains.
- question: Plain English — "Which right or limit applies?" or "What is the main constitutional problem?"
- choices: Parallel structure, everyday language; one clearly best. Vary which letter is correct across sessions.
- modernImplication: Specific, actionable insight for the user's own life.`,
  scenario: `FORMAT: CASE STUDY (use only when a realistic dispute naturally fits)
- situation: 3–4 short sentences — a believable dispute where the assigned doctrine clearly applies. Must sound real, not forced.
- question: Direct — "What is the main constitutional problem?" or "Which right protects…?"
- choices: Plain language; correct answer obvious once the core principle is understood.
- FORBIDDEN: Stretching rare amendments onto unrelated tech plots. If the topic does not fit a natural case, use teach or passage format instead.
- modernImplication: Why getting this right matters for ordinary citizens.`,
};

export function getSituationHeading(format: QuestionFormat | undefined): string {
  if (!format) return "Context";
  return QUESTION_FORMAT_LABELS[format];
}