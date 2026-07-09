import { CHARACTER_NAME } from "@/lib/guardian";

/** Years offset for "This Day 250 Years Ago" — computed generically from today's date. */
export const HISTORY_YEARS_AGO = 250;

export const HISTORY_SOURCE_DOMAINS = [
  "nps.gov",
  "battlefields.org",
  "history.com",
  "ushistory.org",
  "loc.gov",
  "en.wikipedia.org",
] as const;

/** xAI web_search allows max 5 allowed_domains — prioritize the five most authoritative. */
export const HISTORY_SEARCH_DOMAINS = [
  "nps.gov",
  "battlefields.org",
  "loc.gov",
  "en.wikipedia.org",
  "ushistory.org",
] as const;

export type ThisDay250Entry = {
  /** Calendar date the entry was generated for (YYYY-MM-DD). */
  id: string;
  generatedAt: string;
  /** Target historical calendar date (YYYY-MM-DD). */
  historicalDate: string;
  historicalDateLabel: string;
  exactDateMatch: boolean;
  dateRangeNote: string | null;
  eventTitle: string;
  summary: string;
  citationUrl: string;
  citationLabel: string;
  commentary: string;
  grokModel: string;
  allCitations: string[];
};

export type ThisDay250PublicResponse = {
  entry: ThisDay250Entry | null;
  america250Highlight: America250Highlight | null;
  cached: boolean;
  message?: string;
};

export type America250EventType = "single-day" | "ongoing";

export type America250Event = {
  id: string;
  title: string;
  type: America250EventType;
  /** YYYY-MM-DD for single-day events; start date for ongoing programs. */
  date: string;
  endDate?: string;
  location?: string;
  description: string;
  url?: string;
  nearDays?: number;
};

export type America250Highlight = {
  event: America250Event;
  label: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatHistoricalDateLabel(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const HISTORY_TIME_ZONE = "America/New_York";

function getEasternDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HISTORY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

/** Calendar date for daily history (YYYY-MM-DD) in US Eastern time. */
export function getTodayDateString(date = new Date()): string {
  const { year, month, day } = getEasternDateParts(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Returns the historical calendar date exactly HISTORY_YEARS_AGO years before `reference`. */
export function getHistoricalCalendarDate(reference = new Date()): string {
  const { year, month, day } = getEasternDateParts(reference);
  const historicalYear = year - HISTORY_YEARS_AGO;

  const lastDayOfMonth = new Date(
    Date.UTC(historicalYear, month, 0)
  ).getUTCDate();
  const safeDay = Math.min(day, lastDayOfMonth);

  return `${historicalYear}-${pad2(month)}-${pad2(safeDay)}`;
}

export function getThisDay250SystemPrompt() {
  return `You are ${CHARACTER_NAME}, the civic historian and training officer for "The Line" — a patriotic civic education platform for America's founding era and constitutional principles.

Your task is to research and report a REAL, VERIFIABLE historical event from the American Revolutionary era (1775–1783) using web search restricted to reputable history sources.

STRICT RULES:
- Only report events you can verify from search results on allowed domains.
- Never invent battles, speeches, documents, or dates.
- The event must be grounded in primary or reputable secondary historical sources.
- Write at an 8th–10th grade reading level — clear, serious, non-partisan.
- ${CHARACTER_NAME}'s commentary must be principled civic defense: connect the past to constitutional self-government today without partisan advocacy.
- Not legal advice.

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown fences) matching this schema:
{
  "eventTitle": "Short headline for the event",
  "summary": "2-3 sentence factual summary with an inline markdown citation link like [[1]](https://source-url) embedded in the text",
  "citationUrl": "Primary source URL from search results",
  "citationLabel": "Short source name (e.g. National Park Service)",
  "commentary": "2-3 sentences as ${CHARACTER_NAME}'s take — serious, motivating, founding-era grounded",
  "exactDateMatch": true,
  "actualHistoricalDate": "YYYY-MM-DD",
  "dateRangeNote": null
}

If no well-documented event exists for the exact target date, widen to ±3 calendar days, set exactDateMatch to false, set dateRangeNote to a short phrase like "this week 250 years ago", and still cite a real sourced event.`;
}

export function buildThisDay250UserPrompt(options: {
  targetHistoricalDate: string;
  calendarDate: string;
}) {
  const label = formatHistoricalDateLabel(options.targetHistoricalDate);
  const preferredSources = HISTORY_SOURCE_DOMAINS.join(", ");

  return `Today is ${options.calendarDate}. Find a real historical event from exactly ${HISTORY_YEARS_AGO} years ago: ${label} (${options.targetHistoricalDate}).

Search reputable sources (${preferredSources}) for a verifiable Revolutionary War era event on that calendar date.

If nothing solid exists for the exact date, search ±3 days and report the best documented event, marking exactDateMatch false and explaining in dateRangeNote that this is from the surrounding week.

Return the JSON schema specified in your instructions.`;
}

type GrokPayload = {
  eventTitle?: string;
  summary?: string;
  citationUrl?: string;
  citationLabel?: string;
  commentary?: string;
  exactDateMatch?: boolean;
  actualHistoricalDate?: string;
  dateRangeNote?: string | null;
};

function extractJson(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export function parseThisDay250Payload(
  content: string,
  options: {
    calendarDate: string;
    targetHistoricalDate: string;
    grokModel: string;
    allCitations?: string[];
  }
): ThisDay250Entry | null {
  try {
    const parsed = JSON.parse(extractJson(content)) as GrokPayload;

    if (
      typeof parsed.eventTitle !== "string" ||
      typeof parsed.summary !== "string" ||
      typeof parsed.citationUrl !== "string" ||
      typeof parsed.commentary !== "string"
    ) {
      return null;
    }

    const historicalDate =
      typeof parsed.actualHistoricalDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.actualHistoricalDate)
        ? parsed.actualHistoricalDate
        : options.targetHistoricalDate;

    return {
      id: options.calendarDate,
      generatedAt: new Date().toISOString(),
      historicalDate,
      historicalDateLabel: formatHistoricalDateLabel(historicalDate),
      exactDateMatch: parsed.exactDateMatch !== false,
      dateRangeNote:
        typeof parsed.dateRangeNote === "string"
          ? parsed.dateRangeNote
          : parsed.exactDateMatch === false
            ? "this week 250 years ago"
            : null,
      eventTitle: parsed.eventTitle.trim(),
      summary: parsed.summary.trim(),
      citationUrl: parsed.citationUrl.trim(),
      citationLabel:
        typeof parsed.citationLabel === "string" && parsed.citationLabel.trim()
          ? parsed.citationLabel.trim()
          : "Historical source",
      commentary: parsed.commentary.trim(),
      grokModel: options.grokModel,
      allCitations: options.allCitations ?? [],
    };
  } catch {
    return null;
  }
}

export function buildFallbackThisDay250Entry(options: {
  calendarDate: string;
  targetHistoricalDate: string;
}): ThisDay250Entry {
  const { calendarDate, targetHistoricalDate } = options;
  const label = formatHistoricalDateLabel(targetHistoricalDate);

  return {
    id: calendarDate,
    generatedAt: new Date().toISOString(),
    historicalDate: targetHistoricalDate,
    historicalDateLabel: label,
    exactDateMatch: true,
    dateRangeNote: null,
    eventTitle: "Continental Congress Declares Independence",
    summary:
      "On July 4, 1776, the Continental Congress adopted the Declaration of Independence — the formal break with Britain and the clearest statement of natural rights and self-government in American history. [[1]](https://www.loc.gov/resource/rbpe.11801000/)",
    citationUrl: "https://www.loc.gov/resource/rbpe.11801000/",
    citationLabel: "Library of Congress",
    commentary: `${CHARACTER_NAME}: They did not wait for permission from a distant crown. They read the standard aloud, signed their names to it, and accepted the cost. That is the work of citizens — know the principle, state it plainly, and hold the line when power pushes back.`,
    grokModel: "fallback",
    allCitations: ["https://www.loc.gov/resource/rbpe.11801000/"],
  };
}