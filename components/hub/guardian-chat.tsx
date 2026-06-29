"use client";

import { useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Sparkles } from "lucide-react";

import { GrokTeaserPanel } from "@/components/grok/grok-teaser-panel";
import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { CHARACTER_NAME } from "@/lib/guardian";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import type { ChatMessage } from "@/lib/grok";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Can police search my car without a warrant?",
  "What does the Second Amendment actually protect?",
  "When can free speech be restricted?",
];

export function GuardianChat() {
  const { canAccess, isLoading: subscriptionLoading, openUnlockModal } =
    useSubscription();
  const isPremium = canAccess("grok_chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!subscriptionLoading && !isPremium) {
    return (
      <div className="flex w-full flex-col">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-gold" />
          <h3 className="font-heading text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Ask {CHARACTER_NAME} About Your Rights
          </h3>
        </div>
        <GrokTeaserPanel context={{ source: "hub" }} />
      </div>
    );
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode: "full" }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (response.status === 401) {
        setError("Sign in required to chat with " + CHARACTER_NAME + ".");
        return;
      }

      if (response.status === 403) {
        openUnlockModal();
        setError(data.error ?? "Full access required.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to get a response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.message ?? "" },
      ]);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center justify-center gap-2">
        <Sparkles className="size-4 text-gold" />
        <h3 className="font-heading text-sm font-semibold tracking-[0.2em] text-gold uppercase">
          Ask {CHARACTER_NAME} About Your Rights
        </h3>
      </div>

      <div className="relative rounded-2xl border border-navy-border/80 bg-navy/50">
        <div
          ref={scrollRef}
          className="max-h-[min(50vh,320px)] min-h-[200px] space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <GuardianCharacter mood="thinking" size="sm" floating />
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Ask {CHARACTER_NAME} about your constitutional rights. Responses
                are grounded in founding documents and established law — not legal
                advice, but principled civic guidance.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-lg border border-navy-border/80 bg-navy-elevated/60 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-gold/30 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 shrink-0">
                    <GuardianCharacter mood="thinking" size="sm" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "border border-gold/20 bg-gold/10 text-foreground"
                      : "border border-navy-border/80 bg-navy-elevated/80 text-foreground/90"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex items-center gap-3">
              <GuardianCharacter mood="thinking" size="sm" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-gold" />
                <span>{CHARACTER_NAME} is consulting the founding record...</span>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-2 text-sm text-crimson">
              {error}
            </p>
          )}
        </div>

        <div className="border-t border-navy-border/60 p-3 sm:p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <MessageSquare className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your constitutional rights..."
                disabled={isSending}
                className="h-11 w-full rounded-xl border border-navy-border/80 bg-navy-elevated/60 pr-4 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/40 focus:ring-1 focus:ring-gold/20 disabled:opacity-60"
              />
            </div>
            <Button
              type="submit"
              disabled={isSending || !input.trim()}
              className="h-11 shrink-0 border border-gold/30 bg-gold/15 px-4 text-gold hover:bg-gold/25"
            >
              <Send className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}