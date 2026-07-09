/**
 * Maps founding-document passages and nav items to elegant line-icon kinds.
 * Keeps the museum UI scannable without heavy illustration.
 */

export type SectionKind =
  | "preamble"
  | "rights"
  | "powers"
  | "grievance"
  | "structure"
  | "declaration"
  | "pledge"
  | "principle"
  | "amendment"
  | "consent"
  | "general";

export type NavIconKind =
  | "history"
  | "documents"
  | "path"
  | "defenders"
  | "home"
  | "privacy"
  | "declaration"
  | "constitution"
  | "bill-of-rights";

/** More-specific patterns first so grievances/pledges win over broad "rights". */
const SECTION_RULES: { kind: SectionKind; match: RegExp }[] = [
  { kind: "preamble", match: /\bpreamble\b|we the people/i },
  { kind: "grievance", match: /\bgrievance|taxation|trial by jury|abuses|usurpation/i },
  { kind: "pledge", match: /\bpledge|lives.*fortunes|sacred honor/i },
  { kind: "declaration", match: /\bdeclaration\b|independent states|free and independent/i },
  { kind: "consent", match: /\bconsent|governed|just government|institute/i },
  { kind: "principle", match: /\bself-evident|truth|prudence|created equal|unalienable/i },
  { kind: "amendment", match: /\bamendment\b/i },
  {
    kind: "rights",
    match:
      /\bright|liberty|free exercise|speech|press|arms|search|bail|bill of rights/i,
  },
  { kind: "powers", match: /\bpowers?\b|congress|executive|judicial/i },
  { kind: "structure", match: /\bstructure|separation|federalism|enumeration|article\b/i },
];

/** Resolve a passage section title / id to a content-type icon kind. */
export function resolveSectionKind(
  section: string,
  passageId?: string
): SectionKind {
  const haystack = `${section} ${passageId ?? ""}`.trim();
  for (const rule of SECTION_RULES) {
    if (rule.match.test(haystack)) return rule.kind;
  }
  return "general";
}

/** Short scannable label for section kind (optional UI chrome). */
export function sectionKindLabel(kind: SectionKind): string {
  switch (kind) {
    case "preamble":
      return "Preamble";
    case "rights":
      return "Rights";
    case "powers":
      return "Powers";
    case "grievance":
      return "Grievance";
    case "structure":
      return "Structure";
    case "declaration":
      return "Declaration";
    case "pledge":
      return "Pledge";
    case "principle":
      return "Principle";
    case "amendment":
      return "Amendment";
    case "consent":
      return "Consent";
    default:
      return "Passage";
  }
}

export function resolveNavIconKind(href: string, label: string): NavIconKind {
  const h = href.toLowerCase();
  const l = label.toLowerCase();
  if (h === "/" || l === "home") return "home";
  if (h.includes("today-in-history") || h.includes("/history") || l.includes("history"))
    return "history";
  if (h.includes("documents") || l.includes("founding")) return "documents";
  if (h.includes("/path") || l.includes("path")) return "path";
  if (h.includes("certif") || l.includes("defender")) return "defenders";
  if (h.includes("declaration")) return "declaration";
  if (h.includes("constitution") && !h.includes("bill")) return "constitution";
  if (h.includes("bill-of-rights") || l.includes("bill of rights"))
    return "bill-of-rights";
  if (h.includes("privacy")) return "privacy";
  return "documents";
}
