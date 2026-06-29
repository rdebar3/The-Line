import { FOUNDING_DOCUMENTS } from "@/lib/documents";

export type CoreCivicPrinciple = {
  id: string;
  label: string;
  summary: string;
  documentAnchors: string[];
};

export const CORE_CIVIC_PRINCIPLES: CoreCivicPrinciple[] = [
  {
    id: "limited-government",
    label: "Limited Government",
    summary:
      "Government possesses only delegated powers and exists to secure rights — not to grant or revoke them at will.",
    documentAnchors: ["Declaration — Consent", "Article I — Enumerated Powers", "Tenth Amendment"],
  },
  {
    id: "federalism",
    label: "Federalism",
    summary:
      "National and state governments share authority; undelegated powers remain with states and the people.",
    documentAnchors: ["Article IV", "Tenth Amendment", "Fourteenth Amendment — state limits"],
  },
  {
    id: "republicanism",
    label: "Republican Government",
    summary:
      "Legitimate rule flows from the people through representation, elections, and accountable institutions.",
    documentAnchors: ["Declaration — Representation", "Article I", "Fifteenth & Nineteenth Amendments"],
  },
  {
    id: "individual-liberty",
    label: "Individual Liberty",
    summary:
      "Personal freedom is the default; government may restrict it only through lawful, justified process.",
    documentAnchors: ["Declaration — Natural Rights", "Bill of Rights", "Fourteenth Amendment — Due Process"],
  },
  {
    id: "separation-of-powers",
    label: "Separation of Powers",
    summary:
      "Legislative, executive, and judicial functions stay distinct so no branch rules alone.",
    documentAnchors: ["Articles I–III", "checks embedded across the Constitution"],
  },
  {
    id: "rule-of-law",
    label: "Rule of Law",
    summary:
      "Officials are bound by written law, fair procedure, and judicial review — not arbitrary decree.",
    documentAnchors: ["Article III", "Article VI", "Fifth & Sixth Amendments"],
  },
  {
    id: "popular-sovereignty",
    label: "Popular Sovereignty",
    summary:
      "The people are the source of political authority; government serves them by consent.",
    documentAnchors: ["Declaration — Consent", "Preamble — We the People", "Article V"],
  },
];

export function getDocumentPassageCatalog(): string {
  return FOUNDING_DOCUMENTS.map((document) => {
    const passageLines = document.passages.map(
      (passage) =>
        `  • ${passage.section}: ${passage.explanation.replace(/\s+/g, " ").trim()}`
    );
    return `${document.title} (${document.year}) — ${document.subtitle}\n${passageLines.join("\n")}`;
  }).join("\n\n");
}

export function getCorePrinciplesOverview(): string {
  return CORE_CIVIC_PRINCIPLES.map(
    (principle) =>
      `${principle.label}: ${principle.summary} [Anchors: ${principle.documentAnchors.join(", ")}]`
  ).join("\n");
}

export function getDocumentCorpusForPrompt(): string {
  return [
    "FOUNDING DOCUMENT PASSAGES (authoritative in-app corpus — ground scenarios in this material):",
    getDocumentPassageCatalog(),
    "",
    "CORE CIVIC PRINCIPLES (may combine across documents, especially at higher ranks):",
    getCorePrinciplesOverview(),
  ].join("\n");
}