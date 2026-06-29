import {
  createInitialProgressionState,
  PROGRESSION_STORAGE_KEY,
  type ProgressionState,
} from "@/lib/progression";
import { buildUserStorageKey } from "@/lib/user-scope";

export function readProgressionState(): ProgressionState {
  if (typeof window === "undefined") {
    return createInitialProgressionState();
  }

  try {
    const storageKey = buildUserStorageKey(PROGRESSION_STORAGE_KEY);
    const raw = localStorage.getItem(storageKey);

    if (!raw) return createInitialProgressionState();
    const parsed = JSON.parse(raw) as Partial<ProgressionState> & {
      reminders?: unknown;
    };
    const { reminders: _removed, ...rest } = parsed;
    return {
      ...createInitialProgressionState(),
      ...rest,
    };
  } catch {
    return createInitialProgressionState();
  }
}

export function writeProgressionState(state: ProgressionState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    buildUserStorageKey(PROGRESSION_STORAGE_KEY),
    JSON.stringify(state)
  );
}