import { FOUNDING_DOCUMENTS } from "@/lib/documents";

export type DocumentSlug = "declaration" | "constitution" | "bill-of-rights";

const SOURCE_TO_SLUG: Record<string, DocumentSlug> = {
  "Declaration of Independence": "declaration",
  "U.S. Constitution — Preamble": "constitution",
  "U.S. Constitution — Article I": "constitution",
  "U.S. Constitution — Article II": "constitution",
  "U.S. Constitution — Article III": "constitution",
  "U.S. Constitution — Article IV": "constitution",
  "U.S. Constitution — Article V": "constitution",
  "U.S. Constitution — Article VI": "constitution",
  "U.S. Constitution": "constitution",
  "Bill of Rights": "bill-of-rights",
  "U.S. Constitution — Bill of Rights": "bill-of-rights",
};

export function getDocumentSlugFromSource(
  sourceDocument?: string
): DocumentSlug | null {
  if (!sourceDocument) return null;
  if (SOURCE_TO_SLUG[sourceDocument]) return SOURCE_TO_SLUG[sourceDocument];
  if (sourceDocument.includes("Declaration")) return "declaration";
  if (sourceDocument.includes("Bill of Rights")) return "bill-of-rights";
  if (sourceDocument.includes("Constitution")) return "constitution";
  return null;
}

export function getPassageUrl(slug: DocumentSlug, passageId: string): string {
  return `/${slug}#${passageId}`;
}

export function getPassageLabel(passageId: string, slug: DocumentSlug): string {
  const doc = FOUNDING_DOCUMENTS.find((item) => item.slug === slug);
  const passage = doc?.passages.find((item) => item.id === passageId);
  return passage?.section ?? passageId;
}

export type SourceLink = {
  slug: DocumentSlug;
  passageId: string;
  label: string;
  href: string;
};

export function resolveSourceLinks(
  passageIds: string[] | undefined,
  sourceDocument?: string
): SourceLink[] {
  const slug = getDocumentSlugFromSource(sourceDocument);
  if (!slug || !passageIds?.length) return [];

  return passageIds.map((passageId) => ({
    slug,
    passageId,
    label: getPassageLabel(passageId, slug),
    href: getPassageUrl(slug, passageId),
  }));
}