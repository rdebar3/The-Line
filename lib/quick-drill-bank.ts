import { shuffleScenarioChoices } from "@/lib/choice-shuffle";
import { STATIC_SCENARIOS, type Scenario } from "@/lib/scenarios";

export function pickRandomQuickDrill(): Scenario {
  const index = Math.floor(Math.random() * STATIC_SCENARIOS.length);
  const base = STATIC_SCENARIOS[index] ?? STATIC_SCENARIOS[0]!;
  const id = `hero-drill-${base.id}-${Date.now()}`;

  return shuffleScenarioChoices({
    ...base,
    id,
  });
}

export function buildQuickDrillPrompt(scenario: Scenario): string {
  const situation = scenario.situation.trim();
  const question = scenario.question.trim();

  if (question.toLowerCase().includes(situation.slice(0, 24).toLowerCase())) {
    return question;
  }

  const situationEnd = situation.endsWith(".") ? situation : `${situation}.`;
  return `${situationEnd} ${question}`;
}

export function buildQuickDrillExplanation(
  scenario: Scenario,
  correct: boolean
): string {
  const voice = correct ? scenario.guardianPositive : scenario.guardianNegative;
  const sentences =
    scenario.historicalContext.match(/[^.!?]+[.!?]+/g) ?? [
      scenario.historicalContext,
    ];
  const snippet = sentences.slice(0, 1).join(" ").trim();

  return `${voice} ${snippet}`;
}