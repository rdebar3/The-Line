import type { GrokMissionPayload } from "@/lib/grok-progression";
import type { Scenario, ScenarioChoice } from "@/lib/scenarios";

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

/** Deterministic shuffle so the same scenario keeps stable option order in a session. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  for (let index = copy.length - 1; index > 0; index -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const swap = hash % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }

  return copy;
}

function relabelChoices(
  choices: ScenarioChoice[],
  correctChoiceId: string,
  seed: string
): { choices: ScenarioChoice[]; correctChoiceId: string } {
  if (choices.length < 2) {
    return { choices, correctChoiceId };
  }

  const correctLabel = choices.find((choice) => choice.id === correctChoiceId)
    ?.label;
  if (!correctLabel) {
    return { choices, correctChoiceId };
  }

  const shuffled = seededShuffle(choices, seed);
  const relabeled = shuffled.map((choice, index) => ({
    id: CHOICE_IDS[index] ?? choice.id,
    label: choice.label,
  }));

  const nextCorrectId =
    relabeled.find((choice) => choice.label === correctLabel)?.id ??
    correctChoiceId;

  return { choices: relabeled, correctChoiceId: nextCorrectId };
}

export function shuffleScenarioChoices(scenario: Scenario): Scenario {
  const { choices, correctChoiceId } = relabelChoices(
    scenario.choices,
    scenario.correctChoiceId,
    scenario.id
  );

  return { ...scenario, choices, correctChoiceId };
}

export function shuffleMissionChoices(
  mission: GrokMissionPayload,
  missionId: string
): GrokMissionPayload {
  const { choices, correctChoiceId } = relabelChoices(
    mission.choices,
    mission.correctChoiceId,
    missionId
  );

  return { ...mission, choices, correctChoiceId };
}