import {
  getGenerationTopicHistory,
  mergeGenerationHistories,
  recordGenerationTopics,
  type GenerationHistoryInput,
  type GenerationTopicHistory,
} from "@/lib/generation-topic-history";
import {
  BILL_OF_RIGHTS_AMENDMENTS,
  getLeastRecentlyUsedBillOfRightsAmendments,
  pickNextTopicAssignment,
  pickWeakAreaTopicAssignment,
  type TopicAssignment,
} from "@/lib/scenario-curriculum";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";

export const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
export const GROK_MODEL = "grok-3-mini";

export type GenerationMode = "session" | "general" | "weak_area";

export type ResolveTopicAssignmentInput = {
  mode: GenerationMode;
  difficulty: ScenarioDifficulty;
  weakAreas: string[];
  recentTopicIds: string[];
  recentAmendmentTags: string[];
  sessionTopicIds?: string[];
  scenarioIndexInSession?: number;
  sessionSeed?: number;
  focusArea?: string;
};

export type SharedGenerationContext = {
  history: GenerationTopicHistory;
  topicAssignment: TopicAssignment;
};

export type GrokCompletionOptions = {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
};

export async function loadSharedGenerationContext(
  userId: string,
  clientHistory?: GenerationHistoryInput
): Promise<GenerationTopicHistory> {
  const serverHistory = await getGenerationTopicHistory(userId);
  return mergeGenerationHistories(serverHistory, clientHistory);
}

export function resolveTopicAssignment(
  input: ResolveTopicAssignmentInput
): TopicAssignment {
  const sessionSeed = input.sessionSeed ?? Date.now();
  const sessionTopicIds = input.sessionTopicIds ?? [];

  if (input.mode === "weak_area" && input.focusArea?.trim()) {
    return pickWeakAreaTopicAssignment({
      focusArea: input.focusArea.trim(),
      difficulty: input.difficulty,
      recentTopicIds: [...input.recentTopicIds, ...sessionTopicIds],
      recentAmendmentTags: input.recentAmendmentTags,
      sessionSeed,
    });
  }

  return pickNextTopicAssignment({
    difficulty: input.difficulty,
    weakAreas: input.weakAreas,
    recentTopicIds: input.recentTopicIds,
    recentAmendmentTags: input.recentAmendmentTags,
    sessionTopicIds,
    scenarioIndexInSession: input.scenarioIndexInSession ?? 0,
    sessionSeed,
  });
}

export async function prepareSharedGeneration(
  userId: string,
  options: ResolveTopicAssignmentInput & {
    clientHistory?: GenerationHistoryInput;
  }
): Promise<SharedGenerationContext> {
  const history = await loadSharedGenerationContext(userId, options.clientHistory);
  const topicAssignment = resolveTopicAssignment({
    ...options,
    recentTopicIds: history.topicIds,
    recentAmendmentTags: history.amendmentTags,
  });

  return { history, topicAssignment };
}

export function buildAntiRepeatPromptSection(
  history: GenerationTopicHistory
): string {
  const avoidIds =
    history.scenarioIds.length > 0
      ? history.scenarioIds.slice(-20).join(", ")
      : "none";
  const avoidTitles =
    history.scenarioTitles.length > 0
      ? history.scenarioTitles.slice(-20).join(" | ")
      : "none";
  const avoidTopics =
    history.topicIds.length > 0
      ? history.topicIds.slice(-20).join(", ")
      : "none";
  const avoidAmendments =
    history.amendmentTags.length > 0
      ? history.amendmentTags.slice(-15).join(", ")
      : "none";
  const preferredBillOfRights = getLeastRecentlyUsedBillOfRightsAmendments(
    history.amendmentTags,
    5
  ).join(", ");

  return [
    "ANTI-REPEAT RULES (mandatory):",
    `- BANNED scenario IDs/patterns: ${avoidIds}`,
    `- BANNED titles (do not paraphrase or reuse the same fact pattern): ${avoidTitles}`,
    `- BANNED topic IDs (choose a different curriculum angle): ${avoidTopics}`,
    `- Recently served amendment/article/clause tags: ${avoidAmendments}`,
    `- For Bill of Rights assignments, deliberately rotate across the 1st through 10th Amendments. Do NOT lean on the same two or three repeatedly. Prioritize least-recently-used amendments: ${preferredBillOfRights}.`,
    `- Full Bill of Rights rotation set: ${BILL_OF_RIGHTS_AMENDMENTS.join(", ")}.`,
    "- If the assigned topic overlaps recent history, change the setting, question angle, and distractors while staying on the assigned source.",
  ].join("\n");
}

export async function recordSharedGenerationOutput(
  userId: string,
  output: GenerationHistoryInput
): Promise<void> {
  await recordGenerationTopics(userId, output);
}

export async function callGrokCompletion(
  options: GrokCompletionOptions
): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Grok returned an empty response.");
  }

  return content;
}