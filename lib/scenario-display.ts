import type { Scenario } from "@/lib/scenarios";

export function getScenarioSourceDocument(scenario: Scenario): string {
  if (scenario.sourceDocument) return scenario.sourceDocument;

  if (scenario.amendment === "Declaration") return "Declaration of Independence";
  if (scenario.amendment === "Preamble") return "U.S. Constitution — Preamble";
  if (scenario.amendment.startsWith("Art.")) return "U.S. Constitution";
  if (scenario.amendment === "Principle") return "Core Principles";
  if (scenario.amendment === "Multi") return "Multiple Founding Documents";

  if (/^\d/.test(scenario.amendment) || scenario.amendmentLabel.includes("Amendment")) {
    if (
      ["13th", "14th", "15th", "19th"].some((marker) =>
        scenario.amendmentLabel.includes(marker)
      )
    ) {
      return scenario.amendmentLabel;
    }
    return "Bill of Rights";
  }

  return scenario.amendmentLabel;
}

export function getScenarioSourceBadge(scenario: Scenario): string {
  const source = getScenarioSourceDocument(scenario);

  if (source.includes("Declaration")) return "Declaration";
  if (source.includes("Preamble")) return "Preamble";
  if (source.includes("Constitution") && !source.includes("Bill")) return "Constitution";
  if (source === "Core Principles") return "Principles";
  if (source.includes("Multiple")) return "Cross-Document";
  if (source.includes("Bill of Rights")) return "Bill of Rights";
  if (source.includes("Thirteenth")) return "13th Amendment";
  if (source.includes("Fourteenth")) return "14th Amendment";
  if (source.includes("Fifteenth")) return "15th Amendment";
  if (source.includes("Nineteenth")) return "19th Amendment";

  return scenario.amendment;
}