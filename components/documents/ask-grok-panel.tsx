"use client";

/**
 * Ask Grok — archive document chat.
 * Always portaled to document.body so fixed positioning is never clipped.
 * Desktop: right-side drawer. Mobile: bottom sheet.
 */

import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { useGrokTeaser } from "@/hooks/use-grok-teaser";
import { useSubscription } from "@/hooks/use-subscription";
import type { ChatMessage, DocumentChatContext } from "@/lib/grok";
import { CHARACTER_NAME } from "@/lib/guardian";
import { GROK_TEASER_LABEL } from "@/lib/grok-teaser";
import { UNLOCK_CTA_LABEL } from "@/lib/subscription";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Explain this passage in modern terms",
  "What was the historical context?",
  "How does this relate to today?",
  "Why did the founders write this?",
] as const;

export type AskGrokPanelProps = {
  open: boolean;
  onClose: () => void;
  documentContext: DocumentChatContext;
  className?: string;
};

export function AskGrokPanel({
  open,
  onClose,
  documentContext,
  className,
}: AskGrokPanelProps) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { canAccess, isLoading: subscriptionLoading, openUnlockModal } =
    useSubscription();
  const isPremium = canAccess("grok_chat");
  const {
    remaining,
    canUseTeaser,
    recordTeaserUse,
    markLimitReached,
    isLoaded: teaserLoaded,
  } = useGrokTeaser();

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contextKey = useMemo(
    () =>
      [
        documentContext.documentSlug ?? documentContext.documentTitle,
        documentContext.passageSection ?? "",
      ].join("::"),
    [
      documentContext.documentSlug,
      documentContext.documentTitle,
      documentContext.passageSection,
    ]
  );

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setError(null);
    setInput("");
  }, [contextKey, open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const { body } = globalThis.document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [reduceMotion]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    if (!authLoaded) return;

    if (!isSignedIn) {
      setError(
        "Sign in to ask Grok — free accounts get short answers; full access unlocks unlimited counsel."
      );
      return;
    }

    const mode: "full" | "teaser" = isPremium ? "full" : "teaser";

    if (mode === "teaser" && teaserLoaded && !canUseTeaser) {
      openUnlockModal();
      setError("Daily free counsel limit reached. Unlock for unlimited Ask Grok.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages =
      mode === "full" ? [...messages, userMessage] : [userMessage];

    if (mode === "full") {
      setMessages(nextMessages);
    } else {
      setMessages([userMessage]);
    }
    setInput("");
    setError(null);
    setIsSending(true);
    scrollToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          mode,
          documentContext,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (response.status === 401) {
        setError("Sign in required to chat with Grok.");
        return;
      }

      if (response.status === 403) {
        openUnlockModal();
        setError(data.error ?? "Full access required for multi-turn counsel.");
        return;
      }

      if (response.status === 429) {
        markLimitReached();
        openUnlockModal();
        setError(
          data.error ?? "Daily free limit reached. Unlock for unlimited counsel."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to get a response.");
      }

      if (mode === "teaser") {
        recordTeaserUse();
      }

      setMessages((previous) => [
        ...(mode === "full" ? previous : [userMessage]),
        { role: "assistant", content: data.message ?? "" },
      ]);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSheetDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose();
  }

  const contextLabel = documentContext.passageSection
    ? documentContext.passageSection
    : documentContext.documentTitle;

  const panelBody = (
    <div className={cn("flex h-full min-h-0 flex-col bg-[#0C1829]", className)}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[rgba(197,164,110,0.14)] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.45)] bg-gradient-to-b from-[rgba(197,164,110,0.28)] to-[rgba(197,164,110,0.1)] shadow-[0_0_20px_rgba(197,164,110,0.2)]">
              <Sparkles className="size-4 text-[#C5A46E]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-[1.05rem] font-medium leading-snug tracking-[-0.01em] text-[#F5F1E9]">
                Ask Grok About This Document
              </p>
              <p className="mt-0.5 text-[0.65rem] tracking-wide text-[rgba(245,241,233,0.4)]">
                {CHARACTER_NAME} · Grok 4.5
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.1)] px-3 py-1">
            <MessageSquare
              className="size-3 shrink-0 text-[#C5A46E]"
              strokeWidth={1.75}
            />
            <span className="truncate text-[0.7rem] text-[rgba(245,241,233,0.75)]">
              {documentContext.documentTitle}
              {documentContext.passageSection
                ? ` · ${documentContext.passageSection}`
                : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.22)] text-[rgba(245,241,233,0.7)] transition-all hover:border-[rgba(197,164,110,0.45)] hover:bg-[rgba(197,164,110,0.1)] hover:text-[#F5F1E9] active:scale-95"
          aria-label="Close Ask Grok"
        >
          <X className="size-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <GuardianCharacter mood="thinking" size="sm" floating />
            <p className="max-w-sm text-sm leading-relaxed text-[rgba(245,241,233,0.55)]">
              Ask about this{" "}
              {documentContext.passageSection ? "passage" : "document"} in plain
              language. Answers are grounded in the founding text — civic
              guidance, not legal advice.
            </p>
            <div className="flex w-full flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending}
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.08)] px-3.5 py-2 text-left text-[0.75rem] leading-snug text-[rgba(245,241,233,0.78)] transition-all hover:border-[rgba(197,164,110,0.5)] hover:bg-[rgba(197,164,110,0.14)] hover:text-[#F5F1E9] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {!subscriptionLoading && !isPremium && teaserLoaded && (
              <p className="text-[0.65rem] tracking-wide text-[rgba(245,241,233,0.35)]">
                {GROK_TEASER_LABEL}
                {remaining > 0 ? ` · ${remaining} left today` : ""}
              </p>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "flex gap-2.5",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="mt-0.5 shrink-0">
                  <GuardianCharacter mood="thinking" size="sm" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.12)] text-[#F5F1E9]"
                    : "border border-[rgba(197,164,110,0.12)] bg-[rgba(15,29,51,0.85)] text-[rgba(245,241,233,0.88)]"
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
            <div className="flex items-center gap-2 text-sm text-[rgba(245,241,233,0.5)]">
              <Loader2 className="size-4 animate-spin text-[#C5A46E]" />
              <span>Consulting the founding record…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <p className="rounded-xl border border-[rgba(185,55,55,0.35)] bg-[rgba(185,55,55,0.1)] px-3 py-2.5 text-sm text-[#f0a0a0]">
              {error}
            </p>
            {authLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-sm font-medium text-[#C5A46E] underline-offset-2 hover:underline"
                >
                  Sign in to continue
                </button>
              </SignInButton>
            )}
            {!isPremium && (
              <button
                type="button"
                onClick={openUnlockModal}
                className="text-sm font-medium text-[#C5A46E] underline-offset-2 hover:underline"
              >
                {UNLOCK_CTA_LABEL}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[rgba(197,164,110,0.12)] px-4 py-3 sm:px-5 sm:py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <MessageSquare className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[rgba(245,241,233,0.35)]" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this document…"
              disabled={isSending}
              className="h-11 w-full rounded-xl border border-[rgba(197,164,110,0.22)] bg-[rgba(10,22,40,0.65)] pr-3 pl-10 text-sm text-[#F5F1E9] outline-none transition-colors placeholder:text-[rgba(245,241,233,0.32)] focus:border-[rgba(197,164,110,0.5)] focus:ring-1 focus:ring-[rgba(197,164,110,0.22)] disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(197,164,110,0.45)] bg-gradient-to-b from-[#D4B882] via-[#C5A46E] to-[#A88B52] text-[#0A1628] shadow-[0_8px_24px_rgba(197,164,110,0.28)] transition-all hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" strokeWidth={2} />
            )}
          </button>
        </form>
        <p className="mt-2.5 text-center text-[0.6rem] tracking-wide text-[rgba(245,241,233,0.28)]">
          Educational guidance · Not legal advice
        </p>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close Ask Grok"
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Desktop side panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Ask Grok About This Document"
            className="fixed inset-y-0 right-0 z-[210] hidden w-[min(28rem,100vw)] flex-col border-l border-[rgba(197,164,110,0.18)] bg-[#0C1829] shadow-[-24px_0_64px_rgba(0,0,0,0.5)] sm:flex"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            {panelBody}
          </motion.aside>

          {/* Mobile bottom sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ask Grok About This Document"
            className="fixed inset-x-0 bottom-0 z-[210] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[1.75rem] border border-[rgba(197,164,110,0.18)] border-b-0 bg-[#0C1829] shadow-[0_-24px_64px_rgba(0,0,0,0.55)] sm:hidden"
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag={reduceMotion ? false : "y"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.55 }}
            onDragEnd={handleSheetDragEnd}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-3 pb-0 active:cursor-grabbing"
              onPointerDown={(e) => {
                if (reduceMotion) return;
                dragControls.start(e);
              }}
            >
              <span
                aria-hidden
                className="h-1 w-11 rounded-full bg-[rgba(245,241,233,0.2)]"
              />
            </div>
            <div className="min-h-0 flex-1">{panelBody}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.document.body
  );
}

/** Portaled gold FAB — always above page chrome. */
export function AskGrokFab({
  onClick,
  hidden,
  className,
}: {
  onClick: () => void;
  hidden?: boolean;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hidden) return null;

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed z-[190] inline-flex items-center gap-2.5 rounded-full border border-[rgba(197,164,110,0.55)] bg-gradient-to-b from-[#E0C99A] via-[#C5A46E] to-[#A88B52] px-5 py-3.5 text-sm font-bold tracking-[0.04em] text-[#0A1628] shadow-[0_12px_40px_rgba(197,164,110,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition-transform hover:scale-[1.03] hover:brightness-[1.05] active:scale-[0.98]",
        "right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-8 sm:bottom-8",
        className
      )}
      aria-label="Ask Grok About This Document"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-[rgba(10,22,40,0.14)]">
        <Sparkles className="size-3.5" strokeWidth={2.25} />
      </span>
      <span>Ask Grok</span>
    </button>,
    globalThis.document.body
  );
}

/** Gold header / inline control used in the archive sticky bar. */
export function AskGrokHeaderButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(197,164,110,0.5)] bg-gradient-to-b from-[#D4B882] via-[#C5A46E] to-[#A88B52] px-2.5 py-1.5 text-[0.7rem] font-bold tracking-[0.04em] text-[#0A1628] shadow-[0_4px_16px_rgba(197,164,110,0.35)] transition-all hover:brightness-[1.05] active:scale-[0.97] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs",
        className
      )}
      aria-label="Ask Grok About This Document"
    >
      <Sparkles className="size-3.5 shrink-0 sm:size-3.5" strokeWidth={2.25} />
      <span className="whitespace-nowrap">Ask Grok</span>
    </button>
  );
}
