import {
  buildThisDay250UserPrompt,
  getHistoricalCalendarDate,
  getThisDay250SystemPrompt,
  getTodayDateString,
  HISTORY_SEARCH_DOMAINS,
  parseThisDay250Payload,
  buildFallbackThisDay250Entry,
  type ThisDay250Entry,
} from "@/lib/this-day-250";

const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4-1-fast";

type XaiOutputText = {
  type: "output_text";
  text?: string;
  annotations?: Array<{
    type: string;
    url?: string;
  }>;
};

type XaiMessageOutput = {
  type: "message";
  content?: XaiOutputText[];
};

type XaiResponse = {
  output?: XaiMessageOutput[];
  citations?: string[];
};

function extractResponseText(data: XaiResponse): {
  text: string;
  citations: string[];
} {
  const citations = new Set<string>(data.citations ?? []);
  const textParts: string[] = [];

  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type !== "output_text" || !content.text) continue;
      textParts.push(content.text);
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          citations.add(annotation.url);
        }
      }
    }
  }

  return {
    text: textParts.join("\n").trim(),
    citations: [...citations],
  };
}

export async function generateThisDay250Entry(options?: {
  calendarDate?: string;
}): Promise<ThisDay250Entry> {
  const calendarDate = options?.calendarDate ?? getTodayDateString();
  const targetHistoricalDate = getHistoricalCalendarDate(
    new Date(`${calendarDate}T12:00:00Z`)
  );

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return buildFallbackThisDay250Entry({ calendarDate, targetHistoricalDate });
  }

  const systemPrompt = getThisDay250SystemPrompt();
  const userPrompt = buildThisDay250UserPrompt({
    calendarDate,
    targetHistoricalDate,
  });

  try {
    const response = await fetch(XAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "web_search",
            filters: {
              allowed_domains: [...HISTORY_SEARCH_DOMAINS],
            },
          },
        ],
        temperature: 0.3,
        max_output_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("This Day 250 Grok error:", response.status, errorText);
      return buildFallbackThisDay250Entry({ calendarDate, targetHistoricalDate });
    }

    const data = (await response.json()) as XaiResponse;
    const { text, citations } = extractResponseText(data);

    if (!text) {
      return buildFallbackThisDay250Entry({ calendarDate, targetHistoricalDate });
    }

    const parsed = parseThisDay250Payload(text, {
      calendarDate,
      targetHistoricalDate,
      grokModel: GROK_MODEL,
      allCitations: citations,
    });

    if (!parsed) {
      return buildFallbackThisDay250Entry({ calendarDate, targetHistoricalDate });
    }

    return parsed;
  } catch (error) {
    console.error("This Day 250 generation error:", error);
    return buildFallbackThisDay250Entry({ calendarDate, targetHistoricalDate });
  }
}