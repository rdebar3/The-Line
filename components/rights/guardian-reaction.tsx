import { ShieldCheck, ShieldX } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import type { GuardianMood } from "@/lib/guardian";
import { cn } from "@/lib/utils";

type GuardianReactionProps = {
  mood: GuardianMood | "positive" | "negative";
  message: string;
  compact?: boolean;
  variant?: "inline" | "panel";
};

export function splitFeedbackParagraphs(message: string): string[] {
  const trimmed = message.trim();
  if (!trimmed) return [];

  const byNewline = trimmed
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  const byEmDash = trimmed
    .split(/\s+—\s+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (byEmDash.length > 1) return byEmDash;

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return sentences;

  const grouped: string[] = [];
  for (let index = 0; index < sentences.length; index += 2) {
    grouped.push(sentences.slice(index, index + 2).join(" "));
  }

  return grouped;
}

export function GuardianReaction({
  mood,
  message,
  compact = false,
  variant = "inline",
}: GuardianReactionProps) {
  const resolvedMood: GuardianMood =
    mood === "positive"
      ? "success"
      : mood === "negative"
        ? "warning"
        : mood;
  const isSuccess = resolvedMood === "success";
  const paragraphs = splitFeedbackParagraphs(message);

  if (variant === "panel") {
    return (
      <div className="flex flex-col items-center">
        <div className="relative mx-auto mb-6 w-full max-w-[210px]">
          <GuardianCharacter
            mood={resolvedMood}
            size="md"
            floating
            className="w-full"
          />
          <div
            className={cn(
              "absolute -right-1 bottom-0 flex size-11 items-center justify-center rounded-full border-2 shadow-lg ring-2 ring-navy-elevated backdrop-blur-sm",
              isSuccess
                ? "border-gold/55 bg-gold/30 text-gold shadow-[0_4px_20px_rgba(201,162,39,0.35)]"
                : "border-crimson/55 bg-crimson/30 text-crimson shadow-[0_4px_20px_rgba(185,28,28,0.3)]"
            )}
            aria-hidden
          >
            {isSuccess ? (
              <ShieldCheck className="size-5" strokeWidth={2.25} />
            ) : (
              <ShieldX className="size-5" strokeWidth={2.25} />
            )}
          </div>
        </div>

        <p
          className={cn(
            "font-heading text-xs font-semibold tracking-[0.32em] uppercase",
            isSuccess ? "text-gold" : "text-crimson"
          )}
        >
          {isSuccess ? "Line Held" : "Line Tested"}
        </p>

        <div
          className={cn(
            "mt-6 w-full rounded-xl border px-6 py-6",
            isSuccess
              ? "border-gold/20 bg-gold/[0.04]"
              : "border-crimson/20 bg-crimson/[0.04]"
          )}
        >
          <div
            className={cn(
              "space-y-5 border-l-[3px] pl-5",
              isSuccess ? "border-l-gold/50" : "border-l-crimson/50"
            )}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 16)}`}
                className={cn(
                  "font-serif text-[1.0625rem] leading-[1.9] tracking-[0.015em] text-foreground/95",
                  index === 0 && "text-[1.125rem] leading-[1.85] text-foreground"
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border px-5 py-5 text-center transition-all duration-500 sm:flex-row sm:px-6 sm:py-6 sm:text-left",
        isSuccess
          ? "border-gold/30 bg-gold/5 shadow-[0_0_30px_rgba(201,162,39,0.15)]"
          : "border-crimson/30 bg-crimson/5 shadow-[0_0_30px_rgba(185,28,28,0.15)]",
        compact && "px-4 py-4"
      )}
    >
      <div className="relative shrink-0">
        <GuardianCharacter
          mood={resolvedMood}
          size={compact ? "sm" : "md"}
        />
        <div
          className={cn(
            "absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border backdrop-blur-sm",
            isSuccess
              ? "border-gold/40 bg-gold/20 text-gold"
              : "border-crimson/40 bg-crimson/20 text-crimson"
          )}
        >
          {isSuccess ? (
            <ShieldCheck className="size-4" />
          ) : (
            <ShieldX className="size-4" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-heading text-xs font-semibold tracking-[0.25em] uppercase",
            isSuccess ? "text-gold" : "text-crimson"
          )}
        >
          {isSuccess ? "Line Held" : "Line Tested"}
        </p>
        <div className="mt-3 space-y-3">
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 12)}`}
              className="text-sm leading-relaxed text-foreground/90 sm:text-base sm:leading-7"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}