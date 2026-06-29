"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Loader2, Lock, MessageSquare, Sparkles } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import { useGrokTeaser } from "@/hooks/use-grok-teaser";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import type { GrokTeaserContext } from "@/lib/grok-teaser";
import { GROK_TEASER_LABEL } from "@/lib/grok-teaser";
import { UNLOCK_CTA_LABEL } from "@/lib/subscription";
import { cn } from "@/lib/utils";

type GrokTeaserPanelProps = {
  context?: GrokTeaserContext;
  compact?: boolean;
  defaultPrompt?: string;
  className?: string;
};

const HUB_PROMPTS = [
  "What should I study first?",
  "How do I hold the line daily?",
  "Why does the Bill of Rights matter now?",
];

export function GrokTeaserPanel({
  context,
  compact = false,
  defaultPrompt = "",
  className,
}: GrokTeaserPanelProps) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { openUnlockModal } = useSubscription();
  const {
    remaining,
    limit,
    canUseTeaser,
    recordTeaserUse,
    markLimitReached,
    isLoaded,
  } = useGrokTeaser();
  const [input, setInput] = useState(defaultPrompt);
  const [response, setResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompts =
    context?.source === "hub"
      ? HUB_PROMPTS
      : context?.source === "scenario"
        ? [
            "What principle did I miss?",
            "How would you apply this in the field?",
            "What should I drill next?",
          ]
        : context?.source === "scenario_complete"
          ? ["How do I keep improving?", "What rank should I aim for next?"]
          : ["Why unlock full Grok?", "What does full training include?"];

  async function askGrok(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    if (!canUseTeaser) {
      openUnlockModal();
      return;
    }

    setIsSending(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "teaser",
          context,
          messages: [{ role: "user", content: trimmed }],
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (res.status === 401) {
        setError("Sign in to ask questions — free accounts get 3 short answers per day.");
        return;
      }

      if (res.status === 429 || res.status === 403) {
        markLimitReached();
        openUnlockModal();
        setError(data.error ?? "Daily free limit reached. Unlock for unlimited counsel.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get a response.");
      }

      recordTeaserUse();
      setResponse(data.message ?? "");
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  if (!authLoaded || !isLoaded) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-xl border border-navy-border/60 bg-navy/40 p-4",
          className
        )}
      >
        <div className="h-4 w-40 rounded bg-navy-border/50" />
        <div className="mt-3 h-10 rounded bg-navy-border/40" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div
        className={cn(
          "rounded-xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-navy/40 text-center",
          compact ? "p-4" : "p-5 sm:p-6",
          className
        )}
      >
        <GuardianCharacter mood="thinking" size="sm" className="mx-auto" />
        <p className="mt-3 font-heading text-sm font-semibold text-foreground">
          Sign in to preview {CHARACTER_NAME}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Free accounts get {limit} short constitutional answers per day. Unlock
          for unlimited counsel.
        </p>
        <SignInButton mode="redirect" forceRedirectUrl="/">
          <Button className="btn-gold mt-4 w-full sm:w-auto">Sign In</Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-gold/20 bg-gradient-to-b from-gold/[0.06] to-navy/40",
        compact ? "p-4" : "p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <GuardianCharacter mood="thinking" size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <p className="font-heading text-sm font-semibold tracking-wide text-foreground">
              Ask {CHARACTER_NAME}
            </p>
            <span className="rounded-md border border-gold/25 bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-gold uppercase">
              {remaining}/{limit} today
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {GROK_TEASER_LABEL} — short field answers only. Full unlock gives
            unlimited depth, tactical missions, and scenario debriefs.
          </p>
        </div>
      </div>

      {response && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-navy-border/80 bg-navy-elevated/80 px-4 py-3 duration-300">
          <p className="font-heading text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
            {CHARACTER_NAME} says
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90 sm:text-base sm:leading-7">
            {response}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-sm text-crimson">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isSending || !canUseTeaser}
            onClick={() => void askGrok(prompt)}
            className="min-h-10 rounded-lg border border-navy-border/80 bg-navy-elevated/50 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-gold/30 hover:text-foreground disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void askGrok(input);
        }}
        className="mt-3 flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <MessageSquare className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              canUseTeaser
                ? `Quick question for ${CHARACTER_NAME}...`
                : "Daily limit reached"
            }
            disabled={isSending || !canUseTeaser}
            className="h-11 w-full rounded-xl border border-navy-border/80 bg-navy-elevated/60 pr-4 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/40 disabled:opacity-60"
          />
        </div>
        <Button
          type="submit"
          disabled={isSending || !canUseTeaser || !input.trim()}
          className="h-11 shrink-0 border border-gold/30 bg-gold/15 px-4 text-gold hover:bg-gold/25"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          <span className="sr-only">Ask</span>
        </Button>
      </form>

      {!canUseTeaser && (
        <Button
          onClick={openUnlockModal}
          size="sm"
          className="btn-gold mt-4 w-full"
        >
          <Lock className="size-4" />
          {UNLOCK_CTA_LABEL}
        </Button>
      )}
    </div>
  );
}