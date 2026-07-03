import {
  mergeSavedLines,
  SAVED_LINES_STORAGE_KEY,
  type SavedLine,
} from "@/lib/saved-lines";
import { buildUserStorageKey } from "@/lib/user-scope";

export function readSavedLines(): SavedLine[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(buildUserStorageKey(SAVED_LINES_STORAGE_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedLines(lines: SavedLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(SAVED_LINES_STORAGE_KEY),
    JSON.stringify(lines)
  );
}

export function hydrateSavedLines(
  local: SavedLine[],
  remote: SavedLine[] | null
): SavedLine[] {
  const merged = remote ? mergeSavedLines(local, remote) : local;
  writeSavedLines(merged);
  return merged;
}