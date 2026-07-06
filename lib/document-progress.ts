import type { DocumentSlug } from "@/lib/document-links";
import { FOUNDING_DOCUMENTS } from "@/lib/documents";
import type { ProgressionState } from "@/lib/progression";

export type ViewedPassages = Partial<Record<DocumentSlug, string[]>>;

export function getViewedPassages(state: ProgressionState): ViewedPassages {
  return state.viewedPassages ?? {};
}

export function recordPassageView(
  state: ProgressionState,
  documentSlug: DocumentSlug,
  passageId: string
): { state: ProgressionState; isNew: boolean; documentComplete: boolean } {
  const viewed = getViewedPassages(state);
  const existing = viewed[documentSlug] ?? [];

  if (existing.includes(passageId)) {
    return {
      state,
      isNew: false,
      documentComplete: isDocumentFullyRead(documentSlug, existing),
    };
  }

  const nextIds = [...existing, passageId];
  const next: ProgressionState = {
    ...state,
    viewedPassages: {
      ...viewed,
      [documentSlug]: nextIds,
    },
  };

  return {
    state: next,
    isNew: true,
    documentComplete: isDocumentFullyRead(documentSlug, nextIds),
  };
}

export function isDocumentFullyRead(
  slug: DocumentSlug,
  readIds: string[]
): boolean {
  const doc = FOUNDING_DOCUMENTS.find((entry) => entry.slug === slug);
  if (!doc) return false;
  return doc.passages.every((passage) => readIds.includes(passage.id));
}

export function getDocumentReadProgress(
  slug: DocumentSlug,
  readIds: string[]
): { read: number; total: number; complete: boolean } {
  const doc = FOUNDING_DOCUMENTS.find((entry) => entry.slug === slug);
  const total = doc?.passages.length ?? 0;
  const read = doc
    ? doc.passages.filter((passage) => readIds.includes(passage.id)).length
    : 0;
  return {
    read,
    total,
    complete: total > 0 && read >= total,
  };
}

export function mergeViewedPassages(
  local: ViewedPassages,
  remote: ViewedPassages | undefined
): ViewedPassages {
  if (!remote) return local;

  const merged: ViewedPassages = { ...local };
  for (const slug of ["declaration", "constitution", "bill-of-rights"] as const) {
    const localIds = local[slug] ?? [];
    const remoteIds = remote[slug] ?? [];
    merged[slug] = [...new Set([...localIds, ...remoteIds])];
  }
  return merged;
}