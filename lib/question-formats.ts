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
- situation: Quote or closely paraphrase 1–2 sentences from the assigned founding passage (lib/documents), then ONE plain sentence of context. No fictional plot.
- question: Ask what the text means, what it limits, what right/principle it names, or why the Framers included it.
- choices: Test comprehension of the actual document — not a convoluted story.
- modernImplication: One concrete way this text still protects or guides citizens today.`,
  teach: `FORMAT: KEY IDEA (direct teaching)
- situation: 2–3 plain-English sentences explaining the assigned topic from the founding documents — like a brief lesson, NOT a legal thriller or tech dystopia.
- question: Straightforward multiple choice — "What does this provision do?", "Who is limited?", "What is the core principle?"
- choices: Each distractor should reflect a common misconception a citizen might hold. Keep all four options similar in length and tone — no obvious "throwaway" answers.
- modernImplication: Practical takeaway the user can use when engaging government, voting, or defending their rights.`,
  apply: `FORMAT: REAL-WORLD APPLICATION
- situation: 2–4 sentences describing ONE everyday situation Americans actually encounter (search, speech, voting, taxes, permits, courts, federal vs state rules). The doctrine must fit NATURALLY — no Rube Goldberg fact chains.
- question: Which protection, limit, or principle governs?
- choices: Plausible options with parallel structure; one clearly best under the assigned source. Vary which letter is correct across sessions.
- modernImplication: Specific, actionable insight for the user's own life.`,
  scenario: `FORMAT: CASE STUDY (use only when a realistic dispute naturally fits)
- situation: 3–5 sentences — a believable dispute where the assigned doctrine clearly applies. Must sound like something that could happen, not forced analogy.
- FORBIDDEN: Stretching rare amendments onto unrelated tech plots (e.g., data brokers + Third Amendment quartering). If the topic does not fit a natural case, use teach or passage format instead.
- modernImplication: Why getting this right matters for ordinary citizens.`,
};

export function getSituationHeading(format: QuestionFormat | undefined): string {
  if (!format) return "Context";
  return QUESTION_FORMAT_LABELS[format];
}