import {
  getThisDay250EntriesByDates,
  getThisDay250Entry,
  isThisDay250CacheConfigured,
  listThisDay250Archive,
  saveThisDay250Entry,
} from "@/lib/this-day-250-cache";
import { generateThisDay250Entry } from "@/lib/this-day-250-grok";
import {
  getHistoricalCalendarDate,
  getTodayDateString,
  buildFallbackThisDay250Entry,
  type ThisDay250Entry,
} from "@/lib/this-day-250";

const GENERATION_LOCK_PREFIX = "theline:day250:generating:";
const GENERATION_LOCK_TTL_SECONDS = 180;

async function acquireGenerationLock(calendarDate: string): Promise<boolean> {
  if (!isThisDay250CacheConfigured()) return true;

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const result = await redis.set(
    `${GENERATION_LOCK_PREFIX}${calendarDate}`,
    "1",
    { nx: true, ex: GENERATION_LOCK_TTL_SECONDS }
  );

  return result === "OK";
}

async function releaseGenerationLock(calendarDate: string): Promise<void> {
  if (!isThisDay250CacheConfigured()) return;

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  await redis.del(`${GENERATION_LOCK_PREFIX}${calendarDate}`);
}

/**
 * Returns today's cached briefing, generating and storing it once if missing.
 * Used by the public API (lazy fallback) and the daily cron job.
 */
export async function ensureThisDay250Entry(options?: {
  calendarDate?: string;
}): Promise<{
  entry: ThisDay250Entry;
  cached: boolean;
  generated: boolean;
}> {
  const calendarDate = options?.calendarDate ?? getTodayDateString();

  if (isThisDay250CacheConfigured()) {
    const existing = await getThisDay250Entry(calendarDate);
    if (existing) {
      return { entry: existing, cached: true, generated: false };
    }

    const lockAcquired = await acquireGenerationLock(calendarDate);
    if (!lockAcquired) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const waiting = await getThisDay250Entry(calendarDate);
        if (waiting) {
          return { entry: waiting, cached: true, generated: false };
        }
      }
    }

    try {
      const entry = await generateThisDay250Entry({ calendarDate });
      await saveThisDay250Entry(entry);
      return { entry, cached: false, generated: true };
    } finally {
      await releaseGenerationLock(calendarDate);
    }
  }

  const entry = await generateThisDay250Entry({ calendarDate });
  return { entry, cached: false, generated: true };
}

export type ThisDay250PublicResult = {
  entry: ThisDay250Entry | null;
  cached: boolean;
  message?: string;
};

/**
 * Read-only path for the hub and history pages. Never triggers Grok — the daily
 * cron job is responsible for generating and caching each day's entry.
 */
export async function getThisDay250ForPublic(options?: {
  calendarDate?: string;
}): Promise<ThisDay250PublicResult> {
  const calendarDate = options?.calendarDate ?? getTodayDateString();

  if (!isThisDay250CacheConfigured()) {
    const targetHistoricalDate = getHistoricalCalendarDate(
      new Date(`${calendarDate}T12:00:00Z`)
    );

    return {
      entry: buildFallbackThisDay250Entry({
        calendarDate,
        targetHistoricalDate,
      }),
      cached: false,
      message:
        "Daily history cache is not configured; showing a featured moment from the era.",
    };
  }

  const cachedEntry = await getThisDay250Entry(calendarDate);
  if (cachedEntry) {
    return { entry: cachedEntry, cached: true };
  }

  const { dates } = await listThisDay250Archive({ limit: 1, offset: 0 });
  if (dates.length > 0) {
    const [recentEntry] = await getThisDay250EntriesByDates(dates);
    if (recentEntry) {
      return {
        entry: recentEntry,
        cached: true,
        message:
          "Today's briefing is being prepared. Showing the most recent entry.",
      };
    }
  }

  return {
    entry: null,
    cached: false,
    message:
      "Today's history entry is being prepared. Check back after the morning update.",
  };
}