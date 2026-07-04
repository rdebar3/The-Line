import type { DocumentSlug } from "@/lib/document-links";

export const SAVED_LINES_STORAGE_KEY = "theline_saved_lines";
export const SCRIBE_OF_LIBERTY_THRESHOLD = 10;
export const SCRIBE_OF_LIBERTY_BONUS = 500;
export const SAVED_LINE_NOTE_MAX = 500;

export type SavedLineSource = "document" | "scenario" | "republic-simulator";

export type SavedLine = {
  id: string;
  source: SavedLineSource;
  passageText: string;
  title: string;
  subtitle?: string;
  documentSlug?: DocumentSlug;
  passageId?: string;
  scenarioId?: string;
  personalNote?: string;
  savedAt: string;
};

export type SaveLineDraft = {
  id: string;
  source: SavedLineSource;
  passageText: string;
  title: string;
  subtitle?: string;
  documentSlug?: DocumentSlug;
  passageId?: string;
  scenarioId?: string;
};

export function buildDocumentLineId(
  documentSlug: DocumentSlug,
  passageId: string
): string {
  return `doc:${documentSlug}:${passageId}`;
}

export function buildScenarioLineId(scenarioId: string): string {
  return `scenario:${scenarioId}`;
}

export function buildRepublicSimulatorLineId(
  scenarioId: string,
  momentId: string
): string {
  return `republic-sim:${scenarioId}:${momentId}`;
}

export function mergeSavedLines(
  local: SavedLine[],
  remote: SavedLine[]
): SavedLine[] {
  const map = new Map<string, SavedLine>();

  for (const line of remote) {
    map.set(line.id, line);
  }

  for (const line of local) {
    const existing = map.get(line.id);
    if (!existing || new Date(line.savedAt) >= new Date(existing.savedAt)) {
      map.set(line.id, line);
    }
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function excerptLine(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}