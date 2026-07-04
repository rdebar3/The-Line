import type {
  RepublicSimulatorChoice,
  RepublicSimulatorDecision,
  RepublicSimulatorRole,
  RepublicSimulatorScenario,
} from "@/lib/republic-simulator";

export type RepublicSimulatorOutcomeRequest = {
  action: "outcome";
  scenarioId: string;
  roleId: string;
  decisionId: string;
  choiceId: string;
  choiceLabel: string;
  decisionIndex: number;
  totalDecisions: number;
};

export type RepublicSimulatorHistoricalRequest = {
  action: "historical-reality";
  scenarioId: string;
  decisionId: string;
  choiceId: string;
};

export type RepublicSimulatorGrokRequest =
  | RepublicSimulatorOutcomeRequest
  | RepublicSimulatorHistoricalRequest;

export type RepublicSimulatorOutcomeResponse = {
  immediateResult: string;
  constitutionalAnalysis: string;
  founderVoice: string;
};

export type RepublicSimulatorHistoricalQuote = {
  speaker: string;
  text: string;
  source: string;
};

export type RepublicSimulatorHistoricalResponse = {
  whatActuallyHappened: string;
  quotes: RepublicSimulatorHistoricalQuote[];
};

export function getRepublicSimulatorSystemPrompt() {
  return `You are a constitutional historian and Founding-era advisor for The Line's Republic Simulator.

STRICT RULES:
- Maintain rigorous historical accuracy for events between 1790–1791.
- Stay in character as the Founder the user selected (James Madison or a Virginia delegate aligned with Madison).
- Cite real writings when possible: Federalist essays, Madison's speeches, letters, Jefferson-Hamilton memos to Washington.
- Give balanced, educational feedback — praise sound constitutional reasoning, correct misconceptions gently.
- Never invent fake quotations. If uncertain, paraphrase and label as paraphrase.
- Keep language serious, cinematic, and readable — no cartoonish tone.
- Respond ONLY with valid JSON matching the requested schema. No markdown fences.`;
}

export function buildOutcomeUserPrompt(options: {
  scenario: RepublicSimulatorScenario;
  role: RepublicSimulatorRole;
  decision: RepublicSimulatorDecision;
  choice: RepublicSimulatorChoice;
  decisionIndex: number;
}) {
  const { scenario, role, decision, choice, decisionIndex } = options;

  return `Scenario: ${scenario.title} (${scenario.era})
Role: ${role.name} — ${role.title}
Decision ${decisionIndex + 1} of ${scenario.decisions.length}: ${decision.title}

Situation:
${decision.situation}

Historical context:
${decision.historicalContext}

User's choice: ${choice.label}
Choice summary: ${choice.summary}
Historical alignment: ${choice.madisonAlignment} (fidelity ${choice.fidelityScore}/100)

Return JSON:
{
  "immediateResult": "2-3 sentences on the immediate political consequence of this choice in 1790–1791.",
  "constitutionalAnalysis": "3-5 sentences analyzing the constitutional principle at stake. Cite Federalist Papers, Article I, or Madison's known views when relevant.",
  "founderVoice": "2-4 sentences in Madison's voice — measured, republican, wary of consolidated power. Educational, not preachy."
}`;
}

export function buildHistoricalRealityUserPrompt(options: {
  scenario: RepublicSimulatorScenario;
  decision: RepublicSimulatorDecision;
  choice: RepublicSimulatorChoice;
}) {
  const { scenario, decision, choice } = options;

  return `Scenario: ${scenario.title}
Decision: ${decision.title}
User considered: ${choice.label}

Return JSON describing what actually happened historically:
{
  "whatActuallyHappened": "3-5 sentences on the real historical outcome of this stage of the National Bank debate (1790–1791).",
  "quotes": [
    {
      "speaker": "Madison, Hamilton, Jefferson, or Washington",
      "text": "Real or closely paraphrased quote from primary sources",
      "source": "Federalist No. 44, letter, speech, or memo with date if known"
    }
  ]
}

Include 1-2 quotes. Only use real quotations or clearly labeled paraphrases.`;
}

export function parseOutcomePayload(
  content: string
): RepublicSimulatorOutcomeResponse | null {
  try {
    const parsed = JSON.parse(extractJson(content)) as Partial<RepublicSimulatorOutcomeResponse>;
    if (
      typeof parsed.immediateResult === "string" &&
      typeof parsed.constitutionalAnalysis === "string" &&
      typeof parsed.founderVoice === "string"
    ) {
      return {
        immediateResult: parsed.immediateResult.trim(),
        constitutionalAnalysis: parsed.constitutionalAnalysis.trim(),
        founderVoice: parsed.founderVoice.trim(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function parseHistoricalPayload(
  content: string
): RepublicSimulatorHistoricalResponse | null {
  try {
    const parsed = JSON.parse(extractJson(content)) as Partial<RepublicSimulatorHistoricalResponse>;
    if (typeof parsed.whatActuallyHappened !== "string") return null;

    const quotes = Array.isArray(parsed.quotes)
      ? parsed.quotes
          .filter(
            (quote): quote is RepublicSimulatorHistoricalQuote =>
              typeof quote?.speaker === "string" &&
              typeof quote?.text === "string" &&
              typeof quote?.source === "string"
          )
          .slice(0, 3)
      : [];

    return {
      whatActuallyHappened: parsed.whatActuallyHappened.trim(),
      quotes,
    };
  } catch {
    return null;
  }
}

function extractJson(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export function buildFallbackOutcome(options: {
  decision: RepublicSimulatorDecision;
  choice: RepublicSimulatorChoice;
  role: RepublicSimulatorRole;
}): RepublicSimulatorOutcomeResponse {
  const { decision, choice, role } = options;

  const alignmentNote =
    choice.madisonAlignment === "strong"
      ? "Your judgment tracks Madison's published opposition to the bank charter."
      : choice.madisonAlignment === "moderate"
        ? "You split the difference — closer to Madison's caution than to Hamilton's energy."
        : "This path drifts from Madison's strict-construction record on the bank question.";

  return {
    immediateResult: `In the House galleries, ${role.name}'s allies recalculate their whip count. ${choice.summary} The Treasury faction presses for a swift vote while Virginia members demand the constitutional record be read into the journal.`,
    constitutionalAnalysis: `${decision.historicalContext} ${alignmentNote} The core dispute remains whether Article I's enumerated powers — borrowing, taxing, coining — can birth a corporate bank through the necessary and proper clause, or whether that clause becomes an open-ended charter for consolidation.`,
    founderVoice: `I helped draft a Constitution of limited powers, not unlimited convenience. If Congress may create any means it deems useful, the enumeration we fought for in Philadelphia becomes a parchment fiction — and republican government yields to a moneyed engine we were warned against.`,
  };
}

export function buildFallbackHistoricalReality(
  decision: RepublicSimulatorDecision
): RepublicSimulatorHistoricalResponse {
  return {
    whatActuallyHappened: decision.historicalContext,
    quotes: [
      {
        speaker: "James Madison",
        text: "The power of creating a corporation is not among the enumerated powers, and is therefore not granted to Congress.",
        source: "House speech on the national bank, February 1791 (paraphrase of Madison's constitutional argument)",
      },
      {
        speaker: "Alexander Hamilton",
        text: "The means by which national objectives are attained ought to be left to legislative discretion, constrained only by the end to which they are directed.",
        source: "Opinion on the Constitutionality of the Bank, February 1791",
      },
    ],
  };
}