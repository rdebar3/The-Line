import { buildUserStorageKey } from "@/lib/user-scope";

export const GROK_TEASER_STORAGE_KEY = "theline_grok_teaser";
export const FREE_GROK_DAILY_LIMIT = 3;

export const GROK_TEASER_LABEL =
  "Free preview — 3 short answers per day";

export type GrokTeaserState = {
  date: string;
  uses: number;
};

export function getTodayDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function readGrokTeaserState(): GrokTeaserState {
  if (typeof window === "undefined") {
    return { date: getTodayDateString(), uses: 0 };
  }

  try {
    const raw = localStorage.getItem(buildUserStorageKey(GROK_TEASER_STORAGE_KEY));
    if (!raw) return { date: getTodayDateString(), uses: 0 };
    const parsed = JSON.parse(raw) as Partial<GrokTeaserState>;
    const today = getTodayDateString();
    if (parsed.date !== today) {
      return { date: today, uses: 0 };
    }
    return {
      date: today,
      uses: typeof parsed.uses === "number" ? parsed.uses : 0,
    };
  } catch {
    return { date: getTodayDateString(), uses: 0 };
  }
}

export function writeGrokTeaserState(state: GrokTeaserState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(GROK_TEASER_STORAGE_KEY),
    JSON.stringify(state)
  );
}

export function getGrokTeaserRemaining(uses = readGrokTeaserState().uses): number {
  return Math.max(0, FREE_GROK_DAILY_LIMIT - uses);
}

export function markGrokTeaserLimitReached(): GrokTeaserState {
  const state = { date: getTodayDateString(), uses: FREE_GROK_DAILY_LIMIT };
  writeGrokTeaserState(state);
  return state;
}

export function consumeGrokTeaserUse(): {
  success: boolean;
  remaining: number;
  uses: number;
} {
  const state = readGrokTeaserState();
  const today = getTodayDateString();

  if (state.date !== today) {
    state.date = today;
    state.uses = 0;
  }

  if (state.uses >= FREE_GROK_DAILY_LIMIT) {
    return {
      success: false,
      remaining: 0,
      uses: state.uses,
    };
  }

  state.uses += 1;
  writeGrokTeaserState(state);

  return {
    success: true,
    remaining: FREE_GROK_DAILY_LIMIT - state.uses,
    uses: state.uses,
  };
}

export const TEASER_SYSTEM_PROMPT = `You are No Face Patriot, constitutional rights advisor for "The Line."

This is a LIMITED FREE TEASER session. The user has not unlocked full Grok access.

Your job: give a short, motivating field debrief — not a full legal analysis.

Rules:
- Respond in 2-3 sentences maximum (under 80 words).
- Military-inspired, serious, patriotic tone — like a seasoned NCO mentoring a citizen-defender.
- Ground advice in constitutional principles when relevant, but keep it punchy.
- End with one crisp encouragement to keep training or unlock full counsel for depth.
- Do not provide exhaustive legal analysis, case lists, or multi-paragraph answers.
- Do not mention you are an AI. Speak as No Face Patriot.`;

export type GrokTeaserContext = {
  source: "hub" | "scenario" | "scenario_complete" | "paywall";
  scenarioTitle?: string;
  amendmentLabel?: string;
  correct?: boolean;
  question?: string;
};

export function buildTeaserUserPrompt(
  userMessage: string,
  context?: GrokTeaserContext
): string {
  if (!context) return userMessage;

  const lines = [`User question: ${userMessage}`];

  if (context.source === "scenario" && context.scenarioTitle) {
    lines.push(
      `Context: User just finished scenario "${context.scenarioTitle}" (${context.amendmentLabel ?? "constitutional scenario"}).`,
      context.correct === true
        ? "They answered correctly."
        : context.correct === false
          ? "They missed the correct constitutional call."
          : ""
    );
  }

  if (context.source === "scenario_complete") {
    lines.push(
      "Context: User completed their training session. Give a brief motivating debrief on staying sharp with constitutional rights."
    );
  }

  if (context.source === "paywall") {
    lines.push(
      "Context: User hit the free scenario limit. Motivate them to keep training and mention full Grok unlock for deeper counsel — briefly."
    );
  }

  return lines.filter(Boolean).join("\n");
}