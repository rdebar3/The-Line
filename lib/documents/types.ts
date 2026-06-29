export type DocumentAccent = "gold" | "blue" | "crimson";

export type DocumentPassage = {
  id: string;
  section: string;
  text: string;
  explanation: string;
  historicalContext: string;
  modernRelevance: string;
};

export type FoundingDocument = {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  accent: DocumentAccent;
  passages: DocumentPassage[];
};