"use client";

import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  awardScribeOfLibertyIfEligible,
  recordHubActivity,
} from "@/lib/progression";
import { readProgressionState, writeProgressionState } from "@/lib/progression-store";
import { isCloudSaveConfigured } from "@/lib/progression-cloud";
import {
  SAVED_LINE_NOTE_MAX,
  type SaveLineDraft,
  type SavedLine,
} from "@/lib/saved-lines";
import {
  hydrateSavedLines,
  readSavedLines,
  writeSavedLines,
} from "@/lib/saved-lines-store";

type SavedLinesContextValue = {
  lines: SavedLine[];
  isLoaded: boolean;
  count: number;
  isSaved: (id: string) => boolean;
  getLine: (id: string) => SavedLine | undefined;
  saveLine: (draft: SaveLineDraft, personalNote?: string) => Promise<SavedLine>;
  updateNote: (id: string, personalNote: string) => Promise<void>;
  removeLine: (id: string) => Promise<void>;
};

const SavedLinesContext = createContext<SavedLinesContextValue | null>(null);

async function syncCloud(lines: SavedLine[]) {
  if (!isCloudSaveConfigured()) return;
  await fetch("/api/saved-lines", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
}

function applySaveProgression(count: number, isNewSave: boolean) {
  let state = readProgressionState();
  if (isNewSave) {
    state = recordHubActivity(state);
  }
  const { state: next, awarded } = awardScribeOfLibertyIfEligible(state, count);
  if (!isNewSave && !awarded) return;
  writeProgressionState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("theline:progression-local-updated"));
  }
  if (isCloudSaveConfigured()) {
    void fetch("/api/progression", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
  }
}

export function SavedLinesProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [lines, setLines] = useState<SavedLine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const persist = useCallback(
    async (next: SavedLine[], checkMilestone = false) => {
      setLines(next);
      writeSavedLines(next);
      if (isSignedIn && userId && isCloudSaveConfigured()) {
        await syncCloud(next);
      }
      if (checkMilestone) {
        applySaveProgression(next.length, true);
      }
    },
    [isSignedIn, userId]
  );

  useEffect(() => {
    if (!authLoaded) {
      setIsLoaded(false);
      return;
    }

    let local = readSavedLines();

    async function hydrate() {
      if (isSignedIn && userId && isCloudSaveConfigured()) {
        try {
          const res = await fetch("/api/saved-lines");
          if (res.ok) {
            const data = (await res.json()) as { lines?: SavedLine[] };
            local = hydrateSavedLines(local, data.lines ?? []);
          }
        } catch {
          /* local only */
        }
      }
      setLines(local);
      setIsLoaded(true);
    }

    void hydrate();
  }, [authLoaded, isSignedIn, userId]);

  const isSaved = useCallback(
    (id: string) => lines.some((line) => line.id === id),
    [lines]
  );

  const getLine = useCallback(
    (id: string) => lines.find((line) => line.id === id),
    [lines]
  );

  const saveLine = useCallback(
    async (draft: SaveLineDraft, personalNote?: string) => {
      const note = personalNote?.trim().slice(0, SAVED_LINE_NOTE_MAX);
      const existing = lines.find((line) => line.id === draft.id);
      const saved: SavedLine = {
        id: draft.id,
        source: draft.source,
        passageText: draft.passageText,
        title: draft.title,
        subtitle: draft.subtitle,
        documentSlug: draft.documentSlug,
        passageId: draft.passageId,
        scenarioId: draft.scenarioId,
        personalNote: note || existing?.personalNote,
        savedAt: existing?.savedAt ?? new Date().toISOString(),
      };

      const next = existing
        ? lines.map((line) => (line.id === draft.id ? saved : line))
        : [saved, ...lines];

      const isNew = !existing;
      await persist(next, isNew);
      return saved;
    },
    [lines, persist]
  );

  const updateNote = useCallback(
    async (id: string, personalNote: string) => {
      const note = personalNote.trim().slice(0, SAVED_LINE_NOTE_MAX);
      const next = lines.map((line) =>
        line.id === id ? { ...line, personalNote: note || undefined } : line
      );
      await persist(next);
    },
    [lines, persist]
  );

  const removeLine = useCallback(
    async (id: string) => {
      const next = lines.filter((line) => line.id !== id);
      await persist(next);
    },
    [lines, persist]
  );

  const value = useMemo(
    () => ({
      lines,
      isLoaded,
      count: lines.length,
      isSaved,
      getLine,
      saveLine,
      updateNote,
      removeLine,
    }),
    [lines, isLoaded, isSaved, getLine, saveLine, updateNote, removeLine]
  );

  return (
    <SavedLinesContext.Provider value={value}>
      {children}
    </SavedLinesContext.Provider>
  );
}

export function useSavedLines() {
  const context = useContext(SavedLinesContext);
  if (!context) {
    throw new Error("useSavedLines must be used within SavedLinesProvider");
  }
  return context;
}