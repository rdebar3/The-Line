"use client";

/**
 * ArchiveDocumentReader — immersive museum-quality document experience.
 *
 * Layout:
 *  - Sticky deep-navy header (logo · centered title · study progress)
 *  - Left TOC with section links and studied checks
 *  - Center parchment reading surface (serif, ~42rem measure)
 *  - Right context panel (historical / modern / save)
 *  - Mobile: TOC drawer + drag-to-dismiss context bottom sheet
 *
 * Drop-in for FoundingDocument data; ships with Declaration sample text.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  BookOpen,
  Check,
  ChevronRight,
  Lightbulb,
  List,
  Scale,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";

import { useDefenderBadges } from "@/components/badges/defender-badge-provider";
import { useSavedLines } from "@/components/my-lines/saved-lines-provider";
import {
  EraTimeline,
  GoldProgressBar,
  ProgressRing,
  SectionIconBadge,
  SectionMarker,
} from "@/components/ui/visual-nav";
import { useProgression } from "@/hooks/use-progression";
import type { DocumentSlug } from "@/lib/document-links";
import type { DocumentPassage, FoundingDocument } from "@/lib/documents/types";
import { buildDocumentLineId, type SaveLineDraft } from "@/lib/saved-lines";
import { cn } from "@/lib/utils";

/* ── Sample Declaration (used when no document prop is passed) ───────── */

const SAMPLE_DECLARATION: FoundingDocument = {
  slug: "declaration",
  title: "Declaration of Independence",
  subtitle:
    "The moral case for separation and the American creed of natural rights.",
  year: "1776",
  accent: "gold",
  passages: [
    {
      id: "preamble",
      section: "Preamble",
      text: "When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.",
      explanation:
        "The opening announces that independence is not a rash revolt but a reasoned act requiring public justification. The signers claim a rightful place among nations grounded in natural law, not mere force.",
      historicalContext:
        "Drafted primarily by Thomas Jefferson in June 1776 and adopted by the Continental Congress on July 4, the Declaration was addressed to both Americans and a watching world. Its preamble drew on Enlightenment political thought and colonial pamphlets arguing that legitimate government rests on consent.",
      modernRelevance:
        "Every major political break still faces the same question: what principled reasons justify separation? The preamble sets the standard that power must be explained, not merely seized.",
    },
    {
      id: "self-evident-truths",
      section: "Self-Evident Truths",
      text: "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.",
      explanation:
        "This is the American creed: equality at creation, rights that precede government, and a limited list of examples rather than an exhaustive catalog. Rights are unalienable because no ruler can morally revoke what human nature grants.",
      historicalContext:
        "Jefferson's draft built on Locke's life, liberty, and property, changing property to pursuit of Happiness to broaden the moral appeal. The phrase became the philosophical backbone of abolition, suffrage, and civil rights movements.",
      modernRelevance:
        "Courts, activists, and citizens still argue over what equal and unalienable require in practice. This sentence is the benchmark against which American law is judged.",
    },
    {
      id: "consent-and-just-government",
      section: "Consent & Just Government",
      text: "That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed, — That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing its powers in such form, as to them shall seem most likely to effect their Safety and Happiness.",
      explanation:
        "Government exists to protect rights, not to grant them. Its powers are legitimate only by consent, and the people retain a final remedy when rulers destroy the rights government was formed to secure.",
      historicalContext:
        "This passage translated revolutionary resistance into constitutional theory. It justified the break with Britain while warning future American governments that tyranny forfeits legitimacy.",
      modernRelevance:
        "Debates over voter access, executive emergency powers, and police authority often turn on whether government still operates by consent and still secures rights.",
    },
    {
      id: "prudence-and-abuses",
      section: "Prudence & Long Abuses",
      text: "Prudence, indeed, will dictate that Governments long established should not be changed for light and transient causes; and accordingly all experience hath shewn, that mankind are more disposed to suffer, while evils are sufferable, than to right themselves by abolishing the forms to which they are accustomed. But when a long train of abuses and usurpations, pursuing invariably the same Object evinces a design to reduce them under absolute Despotism, it is their right, it is their duty, to throw off such Government, and to provide new Guards for their future security.",
      explanation:
        "Revolution is a last resort, not a first impulse. The colonists argue they endured until a pattern of abuses revealed a deliberate plan of despotism — only then does resistance become duty.",
      historicalContext:
        "Congress needed to show Britain and wary colonists that independence was measured, not anarchic. The grievances that follow prove a long train of abuses rather than isolated disputes.",
      modernRelevance:
        "Reform versus rupture remains the central question in political crises. This passage demands evidence of systemic abuse before radical change.",
    },
    {
      id: "grievance-taxation",
      section: "Grievance — Taxation",
      text: "For imposing Taxes on us without our Consent… He has refused to pass other Laws for the accommodation of large districts of people, unless those people would relinquish the right of Representation in the Legislature, a right inestimable to them and formidable to tyrants only.",
      explanation:
        "No taxation without representation expressed the core principle that people cannot be bound by laws they have no voice in making. Denying representation while demanding obedience is tyranny.",
      historicalContext:
        "After the Seven Years' War, Parliament sought revenue through the Stamp Act and Townshend Acts while denying colonial seats. Colonial assemblies insisted only their own elected legislatures could tax them.",
      modernRelevance:
        "Modern fights over regulatory agencies, federal mandates, and local self-government still ask who must consent to rules that bind citizens.",
    },
    {
      id: "grievance-jury",
      section: "Grievance — Trial by Jury",
      text: "For depriving us in many cases, of the benefits of Trial by Jury: For transporting us beyond Seas to be tried for pretended offences… For taking away our Charters, abolishing our most valuable Laws, and altering fundamentally the Forms of our Governments.",
      explanation:
        "The colonists accused the Crown of stripping local legal protections — jury trials, local charters, and accustomed institutions — and substituting distant, politicized justice.",
      historicalContext:
        "Coercive Acts placed accused colonists before admiralty courts or British tribunals seen as biased. Independent local juries and charters were essential barriers between citizen and crown.",
      modernRelevance:
        "Fair procedure before punishment is still the line between justice and power. Questions about due process and forum echo the same fear of justice rigged by distance and authority.",
    },
    {
      id: "declaration-of-independence",
      section: "Declaration",
      text: "We, therefore, the Representatives of the united States of America, in General Congress, Assembled, appealing to the Supreme Judge of the world for the rectitude of our intentions, do, in the Name, and by Authority of the good People of these Colonies, solemnly publish and declare, That these United Colonies are, and of Right ought to be Free and Independent States…",
      explanation:
        "Here Congress crosses the point of no return: the colonies are declared free states with full sovereign powers. The appeal to divine judgment underscores moral obligation, not mere interest.",
      historicalContext:
        "On July 2, 1776, Congress voted for independence; the Declaration's text was adopted July 4. The act was treason under British law and required extraordinary collective courage.",
      modernRelevance:
        "Sovereignty decisions still turn on who has the legitimate voice to declare political status. This clause is the birth certificate of American self-government.",
    },
    {
      id: "pledge-of-lives",
      section: "Pledge",
      text: "And for the support of this Declaration, with a firm reliance on the protection of divine Providence, we mutually pledge to each other our Lives, our Fortunes and our sacred Honor.",
      explanation:
        "The closing is a personal covenant. The signers stake their property, reputation, and survival on the cause, binding each other to see the revolution through.",
      historicalContext:
        "Many signers suffered confiscation, imprisonment, or ruin. The pledge transformed a philosophical document into a shared oath that made retreat costly and unity morally binding.",
      modernRelevance:
        "Every generation that claims the Declaration's principles must also accept its cost. Civic courage is what turns words on parchment into a living republic.",
    },
  ],
};

const PAPER_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const EASE_LUXURY = [0.22, 1, 0.36, 1] as const;
const GOLD_LINE_MS = 720;
const TOAST_VISIBLE_MS = 3200;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/* ── Premium save confirmation toast ─────────────────────────────────── */

function SavedToMyLinesToast({
  open,
  subtitle,
  onDismiss,
}: {
  open: boolean;
  subtitle?: string;
  onDismiss?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE_LUXURY }}
        >
          <motion.div
            className="archive-save-toast pointer-events-auto relative flex max-w-[min(22rem,100%)] items-center gap-3 overflow-hidden rounded-2xl border border-[rgba(197,164,110,0.35)] bg-[rgba(10,22,40,0.94)] px-4 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_40px_rgba(197,164,110,0.12)] backdrop-blur-xl"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 28, scale: 0.94 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: 16, scale: 0.96 }
            }
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
              mass: 0.85,
            }}
            onClick={onDismiss}
          >
            {/* Soft gold ambient glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-6 top-1/2 size-20 -translate-y-1/2 rounded-full bg-[#C5A46E]/15 blur-2xl"
            />
            <span
              aria-hidden
              className="archive-save-toast-shimmer pointer-events-none absolute inset-0"
            />

            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.4)] bg-gradient-to-b from-[rgba(197,164,110,0.22)] to-[rgba(197,164,110,0.08)] shadow-[0_0_20px_rgba(197,164,110,0.2)]">
              <motion.span
                initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.08,
                  type: "spring",
                  stiffness: 500,
                  damping: 22,
                }}
                className="flex"
              >
                <Archive
                  className="size-4 text-[#C5A46E]"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </motion.span>
            </span>

            <div className="relative min-w-0 pr-1">
              <p className="font-heading text-[0.95rem] font-medium tracking-[-0.01em] text-[#F5F1E9]">
                Saved to My Lines
              </p>
              {subtitle ? (
                <p className="mt-0.5 truncate text-[0.7rem] tracking-wide text-[rgba(245,241,233,0.45)]">
                  {subtitle}
                </p>
              ) : (
                <p className="mt-0.5 text-[0.7rem] tracking-wide text-[rgba(245,241,233,0.4)]">
                  Added to your personal archive
                </p>
              )}
            </div>

            <motion.span
              aria-hidden
              className="absolute inset-x-5 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-[#C5A46E]/80 to-transparent"
              initial={reduceMotion ? false : { scaleX: 0, opacity: 0.4 }}
              animate={{ scaleX: 1, opacity: 0.85 }}
              transition={{
                delay: reduceMotion ? 0 : 0.12,
                duration: 0.65,
                ease: EASE_LUXURY,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    globalThis.document.body
  );
}

/* ── Save to My Lines with gold line draw + toast ────────────────────── */

function SaveToMyLinesButton({
  draft,
  documentSlug,
  passageId,
  onStudied,
  onSavedToast,
  className,
}: {
  draft: SaveLineDraft;
  documentSlug: string;
  passageId: string;
  /** Sync parent studied UI after save (also records via recordPassageView). */
  onStudied?: (passageId: string) => void;
  /** Show the global confirmation toast after a successful first save. */
  onSavedToast?: (subtitle: string) => void;
  className?: string;
}) {
  const { isSaved, saveLine } = useSavedLines();
  const { recordPassageView } = useProgression();
  const { requestDocumentBadge } = useDefenderBadges();
  const reduceMotion = useReducedMotion();

  const saved = isSaved(draft.id);
  const [drawing, setDrawing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const justSavedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (justSavedTimerRef.current != null) {
        window.clearTimeout(justSavedTimerRef.current);
      }
    };
  }, []);

  async function handleSave() {
    if (busy) return;
    setBusy(true);

    try {
      if (!saved) {
        // 1) Gold line draw
        setDrawing(true);
        if (!reduceMotion) {
          await wait(GOLD_LINE_MS);
        }

        // 2) Persist to My Lines via saved-lines provider
        await saveLine(draft, "");

        // 3) Record study progression
        const result = recordPassageView(
          documentSlug as DocumentSlug,
          passageId
        );
        if (result?.documentComplete) {
          void requestDocumentBadge(documentSlug as DocumentSlug);
        }
        onStudied?.(passageId);

        // 4) Button confirmation + premium toast (after line draw)
        setJustSaved(true);
        setDrawing(false);
        onSavedToast?.(draft.title || "Passage");

        if (justSavedTimerRef.current != null) {
          window.clearTimeout(justSavedTimerRef.current);
        }
        justSavedTimerRef.current = window.setTimeout(() => {
          setJustSaved(false);
        }, 2000);
      } else {
        // Already archived — re-sync provider state / notes
        await saveLine(draft, "");
      }
    } finally {
      setBusy(false);
    }
  }

  const isComplete = saved || justSaved;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={busy}
        aria-label={isComplete ? "Saved to My Lines" : "Save to My Lines"}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.04em] transition-all duration-300",
          isComplete
            ? "border border-[rgba(197,164,110,0.5)] bg-[rgba(197,164,110,0.12)] text-[#C5A46E]"
            : "border border-[rgba(197,164,110,0.45)] bg-gradient-to-b from-[#D4B882] via-[#C5A46E] to-[#A88B52] text-[#0A1628] shadow-[0_10px_32px_rgba(197,164,110,0.32)] hover:brightness-[1.04] hover:shadow-[0_12px_36px_rgba(197,164,110,0.4)] active:scale-[0.985]",
          busy && "cursor-wait opacity-90"
        )}
      >
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border transition-all duration-300",
            isComplete
              ? "border-[#C5A46E]/65 bg-[#C5A46E]/22"
              : "border-[rgba(10,22,40,0.22)] bg-[rgba(10,22,40,0.08)] group-hover:bg-[rgba(10,22,40,0.12)]"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isComplete ? (
              <motion.span
                key="check"
                initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_LUXURY }}
                className="flex"
              >
                <Check className="size-3 stroke-[2.5]" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
        <span>{isComplete ? "Saved to My Lines" : "Save to My Lines"}</span>

        {/* Gold line draw animation */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-7 bottom-2.5 h-px overflow-hidden"
        >
          <span
            className={cn(
              "block h-full origin-left bg-gradient-to-r from-transparent via-[#F5F1E9] to-transparent",
              drawing && !reduceMotion && "archive-gold-line-draw",
              isComplete && !drawing && "opacity-70"
            )}
            style={
              drawing || isComplete
                ? undefined
                : ({ transform: "scaleX(0)" } as CSSProperties)
            }
          />
        </span>
      </button>

      {/* Ambient gold stroke under the control */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-[74%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#C5A46E] to-transparent transition-opacity duration-300",
          drawing && !reduceMotion && "archive-gold-line-draw",
          !(drawing || justSaved || saved) && "scale-x-0 opacity-0",
          isComplete && !drawing && "opacity-80"
        )}
      />
    </div>
  );
}

/* ── Context panel content ───────────────────────────────────────────── */

function PassageContext({
  passage,
  documentTitle,
  documentSlug,
  onClose,
  showClose,
  onStudied,
  onSavedToast,
}: {
  passage: DocumentPassage;
  documentTitle: string;
  documentSlug: string;
  onClose?: () => void;
  showClose?: boolean;
  onStudied?: (passageId: string) => void;
  onSavedToast?: (subtitle: string) => void;
}) {
  const draft: SaveLineDraft = {
    id: buildDocumentLineId(documentSlug as DocumentSlug, passage.id),
    source: "document",
    passageText: passage.text,
    title: passage.section,
    subtitle: documentTitle,
    documentSlug: documentSlug as DocumentSlug,
    passageId: passage.id,
  };

  const quote =
    passage.text.length > 180
      ? `${passage.text.slice(0, 180).trim()}…`
      : passage.text;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-[rgba(197,164,110,0.12)] pb-5">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold tracking-[0.28em] text-[#C5A46E] uppercase">
            Passage context
          </p>
          <h2 className="mt-2.5 font-heading text-[1.35rem] font-medium leading-snug tracking-[-0.01em] text-[#F5F1E9]">
            {passage.section}
          </h2>
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.18)] text-[rgba(245,241,233,0.6)] transition-all duration-200 hover:border-[rgba(197,164,110,0.4)] hover:bg-[rgba(197,164,110,0.08)] hover:text-[#F5F1E9] active:scale-95"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-6 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        <blockquote className="border-l-[2px] border-[#C5A46E]/50 pl-4 font-heading text-[0.975rem] leading-[1.75] tracking-[0.01em] text-[rgba(245,241,233,0.7)] italic">
          &ldquo;{quote}&rdquo;
        </blockquote>

        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <Lightbulb className="size-3.5 text-[#C5A46E]" strokeWidth={1.75} />
            <h3 className="text-[0.625rem] font-semibold tracking-[0.2em] text-[rgba(245,241,233,0.5)] uppercase">
              Explanation
            </h3>
          </div>
          <p className="text-[0.9rem] leading-[1.7] text-[rgba(245,241,233,0.84)]">
            {passage.explanation}
          </p>
        </section>

        <section className="rounded-2xl border border-[rgba(197,164,110,0.14)] bg-[rgba(10,22,40,0.5)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)]">
              <BookOpen className="size-3.5 text-[#C5A46E]" strokeWidth={1.75} />
            </span>
            <h3 className="text-[0.625rem] font-semibold tracking-[0.2em] text-[#C5A46E] uppercase">
              Historical Context
            </h3>
          </div>
          <p className="text-[0.9rem] leading-[1.7] text-[rgba(245,241,233,0.64)]">
            {passage.historicalContext}
          </p>
        </section>

        <section className="rounded-2xl border border-[rgba(197,164,110,0.14)] bg-[rgba(10,22,40,0.5)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)]">
              <Scale className="size-3.5 text-[#C5A46E]" strokeWidth={1.75} />
            </span>
            <h3 className="text-[0.625rem] font-semibold tracking-[0.2em] text-[#C5A46E] uppercase">
              Modern Relevance
            </h3>
          </div>
          <p className="text-[0.9rem] leading-[1.7] text-[rgba(245,241,233,0.64)]">
            {passage.modernRelevance}
          </p>
        </section>
      </div>

      <div className="mt-7 shrink-0 border-t border-[rgba(197,164,110,0.1)] pt-6">
        <SaveToMyLinesButton
          draft={draft}
          documentSlug={documentSlug}
          passageId={passage.id}
          onStudied={onStudied}
          onSavedToast={onSavedToast}
        />
        <p className="mt-3.5 text-center text-[0.7rem] leading-relaxed tracking-wide text-[rgba(245,241,233,0.32)]">
          Lines you save appear in My Lines — your personal archive of the
          standard.
        </p>
      </div>
    </div>
  );
}

function EmptyContext() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.06)] shadow-[0_0_40px_rgba(197,164,110,0.08)]">
        <BookOpen className="size-5 text-[#C5A46E]" strokeWidth={1.5} />
      </div>
      <p className="mt-6 font-heading text-xl font-medium tracking-[-0.01em] text-[#F5F1E9]">
        Select a passage
      </p>
      <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-[rgba(245,241,233,0.42)]">
        Tap any paragraph to open historical context, modern relevance, and save
        it to My Lines.
      </p>
      <div
        aria-hidden
        className="mt-8 h-px w-12 bg-gradient-to-r from-transparent via-[#C5A46E]/50 to-transparent"
      />
    </div>
  );
}

/* ── TOC list (shared desktop / mobile) ──────────────────────────────── */

function TocList({
  passages,
  selectedId,
  readIds,
  onJump,
}: {
  passages: DocumentPassage[];
  selectedId: string | null;
  readIds: Set<string>;
  onJump: (id: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {passages.map((passage, index) => {
        const active = selectedId === passage.id;
        const read = readIds.has(passage.id);
        return (
          <li key={passage.id}>
            <button
              type="button"
              onClick={() => onJump(passage.id)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300",
                active
                  ? "bg-[rgba(197,164,110,0.1)]"
                  : "hover:bg-[rgba(197,164,110,0.05)]"
              )}
            >
              <SectionIconBadge
                section={passage.section}
                passageId={passage.id}
                active={active}
                read={read}
                size="sm"
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm leading-snug transition-colors duration-200",
                    active
                      ? "font-medium text-[#C5A46E]"
                      : "text-[rgba(245,241,233,0.62)] group-hover:text-[#F5F1E9]"
                  )}
                >
                  {passage.section}
                </span>
                <span className="mt-0.5 block font-heading text-[0.6rem] tracking-[0.14em] text-[rgba(245,241,233,0.28)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Main reader ─────────────────────────────────────────────────────── */

type ArchiveDocumentReaderProps = {
  document?: FoundingDocument;
  className?: string;
};

export function ArchiveDocumentReader({
  document: documentProp,
  className,
}: ArchiveDocumentReaderProps) {
  const doc = documentProp ?? SAMPLE_DECLARATION;
  const reduceMotion = useReducedMotion();
  const { recordPassageView, state } = useProgression();
  const { requestDocumentBadge } = useDefenderBadges();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [saveToast, setSaveToast] = useState<{
    open: boolean;
    subtitle: string;
  }>({ open: false, subtitle: "" });
  const lastRecordedRef = useRef<string | null>(null);
  const passageRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const sheetDragControls = useDragControls();
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const selectedPassage =
    doc.passages.find((p) => p.id === selectedId) ?? null;

  // Hydrate read progress from progression state when available
  useEffect(() => {
    const viewed = state?.viewedPassages?.[doc.slug as DocumentSlug];
    if (!viewed?.length) return;
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const id of viewed) next.add(id);
      return next;
    });
  }, [state?.viewedPassages, doc.slug]);

  // Deep-link support
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    if (!doc.passages.some((p) => p.id === hash)) return;
    setSelectedId(hash);
    requestAnimationFrame(() => {
      passageRefs.current
        .get(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [doc.passages]);

  // Lock body scroll when mobile sheet / TOC is open
  useEffect(() => {
    const isMobilePanel =
      selectedId && window.matchMedia("(max-width: 1279px)").matches;
    if (!tocOpen && !isMobilePanel) return;
    const { body } = globalThis.document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [selectedId, tocOpen]);

  // Escape closes drawers / sheets
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (tocOpen) {
        setTocOpen(false);
        return;
      }
      if (selectedId) setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, tocOpen]);

  const markReadAndRecord = useCallback(
    (passageId: string) => {
      setReadIds((prev) => {
        if (prev.has(passageId)) return prev;
        const next = new Set(prev);
        next.add(passageId);
        return next;
      });

      const key = `${doc.slug}:${passageId}`;
      if (lastRecordedRef.current === key) return;
      lastRecordedRef.current = key;

      const result = recordPassageView(doc.slug as DocumentSlug, passageId);
      if (result?.documentComplete) {
        void requestDocumentBadge(doc.slug as DocumentSlug);
      }
    },
    [doc.slug, recordPassageView, requestDocumentBadge]
  );

  /** UI + progression sync after Save to My Lines (button also calls recordPassageView). */
  const handlePassageStudied = useCallback(
    (passageId: string) => {
      markReadAndRecord(passageId);
    },
    [markReadAndRecord]
  );

  const showSavedToast = useCallback((subtitle: string) => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setSaveToast({ open: true, subtitle });
    toastTimerRef.current = window.setTimeout(() => {
      setSaveToast((prev) => ({ ...prev, open: false }));
    }, TOAST_VISIBLE_MS);
  }, []);

  function selectPassage(passageId: string) {
    const next = selectedId === passageId ? null : passageId;
    setSelectedId(next);
    if (next) {
      markReadAndRecord(next);
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", `#${next}`);
      }
    }
  }

  function jumpToPassage(passageId: string) {
    selectPassage(passageId);
    setTocOpen(false);
    requestAnimationFrame(() => {
      passageRefs.current.get(passageId)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  function closeContext() {
    setSelectedId(null);
  }

  function handleSheetDragEnd(_: unknown, info: PanInfo) {
    const shouldClose =
      info.offset.y > 100 || info.velocity.y > 500;
    if (shouldClose) closeContext();
  }

  const progress = useMemo(() => {
    const total = doc.passages.length;
    const read = doc.passages.filter((p) => readIds.has(p.id)).length;
    return {
      read,
      total,
      pct: total === 0 ? 0 : Math.round((read / total) * 100),
    };
  }, [doc.passages, readIds]);

  const setPassageRef = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) passageRefs.current.set(id, node);
      else passageRefs.current.delete(id);
    },
    []
  );

  return (
    <div
      className={cn(
        "archive-reader relative flex min-h-[calc(100dvh-var(--site-header-height,4rem))] flex-col bg-[#0A1628]",
        className
      )}
    >
      {/* ── Reader header ───────────────────────────────────────────── */}
      <header className="sticky top-[var(--site-header-height,4rem)] z-30 border-b border-[rgba(197,164,110,0.12)] bg-[#0A1628]/95 backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 max-w-[90rem] items-center px-3 sm:h-[4.25rem] sm:px-6">
          {/* Left: TOC (mobile) + elegant logo */}
          <div className="z-10 flex min-w-0 shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTocOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(197,164,110,0.16)] text-[rgba(245,241,233,0.7)] transition-all duration-200 hover:border-[rgba(197,164,110,0.35)] hover:bg-[rgba(197,164,110,0.06)] hover:text-[#F5F1E9] lg:hidden"
              aria-label="Open table of contents"
            >
              <List className="size-4" />
            </button>

            <Link
              href="/"
              className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <span
                aria-hidden
                className="relative flex size-2 items-center justify-center"
              >
                <span className="absolute size-2 rounded-full bg-[#C5A46E]/30 blur-[3px]" />
                <span className="relative size-1.5 rounded-full bg-[#C5A46E] shadow-[0_0_10px_rgba(197,164,110,0.55)]" />
              </span>
              <span className="font-heading text-base font-semibold tracking-[0.06em] text-[#F5F1E9] sm:text-lg">
                The Line
              </span>
            </Link>
          </div>

          {/* Center: document title (serif) */}
          <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center px-28 sm:px-36 md:px-44">
            <p className="hidden text-[0.6rem] font-medium tracking-[0.22em] text-[#C5A46E]/90 uppercase sm:block">
              {doc.year} · Archive
            </p>
            <p className="max-w-full truncate font-heading text-sm font-medium tracking-[-0.01em] text-[rgba(245,241,233,0.92)] sm:mt-0.5 sm:text-base md:text-[1.05rem]">
              {doc.title}
            </p>
          </div>

          {/* Right: study progress ring + gold bar */}
          <div className="z-10 ml-auto flex shrink-0 items-center gap-3 sm:gap-3.5">
            <div className="hidden flex-col items-end gap-1 sm:flex">
              <p className="text-[0.65rem] font-medium tracking-wide text-[rgba(245,241,233,0.48)] tabular-nums sm:text-[0.7rem]">
                <span className="text-[#C5A46E]">{progress.read}</span>
                <span className="mx-1 text-[rgba(245,241,233,0.28)]">of</span>
                <span className="text-[rgba(245,241,233,0.72)]">
                  {progress.total}
                </span>
                <span className="ml-1.5 text-[rgba(245,241,233,0.38)]">
                  studied
                </span>
              </p>
              <GoldProgressBar
                value={progress.pct}
                className="w-28 sm:w-32"
                label={`${progress.read} of ${progress.total} sections studied`}
              />
            </div>
            <ProgressRing
              value={progress.pct}
              size={40}
              strokeWidth={2.5}
              label={`${progress.read} of ${progress.total} sections studied`}
            >
              <span className="font-heading text-[0.65rem] font-medium tabular-nums text-[#C5A46E] sm:text-[0.7rem]">
                {progress.pct}
                <span className="text-[0.55rem] text-[rgba(197,164,110,0.7)]">
                  %
                </span>
              </span>
            </ProgressRing>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-[90rem] flex-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_380px]">
        <aside className="hidden border-r border-[rgba(197,164,110,0.1)] lg:block">
          <nav
            aria-label="Table of contents"
            className="sticky top-[calc(var(--site-header-height,4rem)+4.25rem)] max-h-[calc(100dvh-var(--site-header-height,4rem)-4.25rem)] overflow-y-auto overscroll-contain px-4 py-9 sm:px-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-md border border-[rgba(197,164,110,0.22)] bg-[rgba(197,164,110,0.08)]">
                <List className="size-3 text-[#C5A46E]" strokeWidth={1.75} />
              </span>
              <p className="text-[0.625rem] font-semibold tracking-[0.28em] text-[#C5A46E] uppercase">
                Contents
              </p>
            </div>
            <div className="mt-5">
              <GoldProgressBar
                value={progress.pct}
                className="h-[2px]"
                label={`${progress.pct}% of document studied`}
              />
              <p className="mt-2 text-[0.65rem] tracking-wide text-[rgba(245,241,233,0.38)] tabular-nums">
                {progress.read}/{progress.total} passages
              </p>
            </div>
            <div className="mt-5">
              <TocList
                passages={doc.passages}
                selectedId={selectedId}
                readIds={readIds}
                onJump={jumpToPassage}
              />
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="archive-parchment relative mx-auto min-h-full px-5 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-16 lg:py-20">
            {/* Subtle paper texture layers */}
            <div
              aria-hidden
              className="archive-paper-grain pointer-events-none absolute inset-0 opacity-100"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.032] mix-blend-multiply"
              style={{ backgroundImage: PAPER_NOISE }}
            />

            <div className="relative mx-auto max-w-[42rem]">
              <header className="mb-12 text-center sm:mb-14">
                <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-[#8B7355] uppercase">
                  {doc.slug === "declaration"
                    ? `In Congress, July 4, ${doc.year}`
                    : `${doc.year} · Archive`}
                </p>
                <h1 className="mt-5 font-heading text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] text-[#1a1520] sm:text-4xl md:text-[2.75rem]">
                  {doc.title}
                </h1>
                <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed tracking-[0.01em] text-[#5c5346] sm:text-base">
                  {doc.subtitle}
                </p>
                <div
                  aria-hidden
                  className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-[#C5A46E] to-transparent"
                />
                <EraTimeline
                  currentYear={doc.year}
                  currentSlug={doc.slug}
                  variant="parchment"
                  className="mx-auto mt-8 max-w-md px-2"
                />
                <p className="mt-7 text-[0.7rem] tracking-[0.14em] text-[#8B7355]/85">
                  Tap a passage to study it
                </p>
              </header>

              <div className="space-y-2">
                {doc.passages.map((passage, index) => {
                  const active = selectedId === passage.id;
                  const read = readIds.has(passage.id);

                  return (
                    <button
                      key={passage.id}
                      ref={(node) => setPassageRef(passage.id, node)}
                      id={`passage-${passage.id}`}
                      type="button"
                      onClick={() => selectPassage(passage.id)}
                      className={cn(
                        "archive-passage group relative w-full rounded-2xl border border-transparent px-5 py-6 text-left sm:px-7 sm:py-7",
                        active && "archive-passage-active",
                        !active &&
                          "hover:-translate-y-px hover:border-[rgba(197,164,110,0.18)] hover:bg-[rgba(197,164,110,0.06)]",
                        read &&
                          !active &&
                          "border-[rgba(197,164,110,0.08)] bg-[rgba(197,164,110,0.035)]"
                      )}
                    >
                      {/* Gold accent border rail */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-6 bottom-6 left-0 w-[2.5px] rounded-full bg-gradient-to-b from-[#C5A46E]/40 via-[#C5A46E] to-[#C5A46E]/40 transition-all duration-300",
                          active
                            ? "opacity-100 shadow-[0_0_12px_rgba(197,164,110,0.55)]"
                            : "opacity-0 group-hover:opacity-45"
                        )}
                      />

                      <div className="mb-3 flex items-center justify-between gap-3">
                        <SectionMarker
                          section={passage.section}
                          passageId={passage.id}
                          index={index}
                          tone="parchment"
                        />
                        <span className="flex items-center gap-2">
                          <AnimatePresence mode="popLayout">
                            {read && (
                              <motion.span
                                key="studied"
                                initial={
                                  reduceMotion
                                    ? false
                                    : { opacity: 0, y: 4, scale: 0.92 }
                                }
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={
                                  reduceMotion
                                    ? undefined
                                    : { opacity: 0, scale: 0.9 }
                                }
                                transition={{
                                  duration: 0.4,
                                  ease: EASE_LUXURY,
                                }}
                                className="archive-studied-badge inline-flex items-center gap-1 rounded-full border border-[rgba(168,139,82,0.28)] bg-[rgba(197,164,110,0.1)] px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.12em] text-[#A88B52] uppercase"
                              >
                                <Check className="size-3 stroke-[2.5]" />
                                Studied
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <ChevronRight
                            className={cn(
                              "size-3.5 text-[#8B7355]/55 transition-transform duration-300",
                              active && "rotate-90 text-[#C5A46E]"
                            )}
                          />
                        </span>
                      </div>

                      <p
                        className={cn(
                          "font-heading text-[1.0625rem] leading-[1.95] tracking-[0.015em] text-[#1f1a14] sm:text-[1.125rem] sm:tracking-[0.018em]",
                          active && "text-[#15110c]"
                        )}
                      >
                        {passage.text}
                      </p>

                      {active && (
                        <span
                          aria-hidden
                          className="archive-gold-line-draw pointer-events-none absolute inset-x-5 bottom-3.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-[#C5A46E]/0 via-[#C5A46E]/75 to-[#C5A46E]/0 sm:inset-x-7"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <footer className="mt-16 border-t border-[rgba(139,115,85,0.18)] pt-10 text-center">
                <p className="font-heading text-[0.95rem] leading-relaxed tracking-[0.01em] text-[#5c5346] italic">
                  &ldquo;We mutually pledge to each other our Lives, our Fortunes
                  and our sacred Honor.&rdquo;
                </p>
                <p className="mt-5 text-[0.625rem] tracking-[0.2em] text-[#8B7355]/75 uppercase">
                  National Archives · Public domain
                </p>
              </footer>
            </div>
          </div>
        </main>

        <aside className="hidden border-l border-[rgba(197,164,110,0.1)] bg-[#0C1829] xl:block">
          <div className="sticky top-[calc(var(--site-header-height,4rem)+4.25rem)] max-h-[calc(100dvh-var(--site-header-height,4rem)-4.25rem)] overflow-y-auto overscroll-contain p-7">
            <AnimatePresence mode="wait">
              {selectedPassage ? (
                <motion.div
                  key={selectedPassage.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, ease: EASE_LUXURY }}
                >
                  <PassageContext
                    passage={selectedPassage}
                    documentTitle={doc.title}
                    documentSlug={doc.slug}
                    onStudied={handlePassageStudied}
                    onSavedToast={showSavedToast}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <EmptyContext />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* ── Mobile TOC drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close table of contents"
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setTocOpen(false)}
            />
            <motion.nav
              aria-label="Table of contents"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-[rgba(197,164,110,0.14)] bg-[#0A1628] shadow-2xl lg:hidden"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(197,164,110,0.12)] px-4 py-4">
                <p className="text-[0.625rem] font-semibold tracking-[0.28em] text-[#C5A46E] uppercase">
                  Contents
                </p>
                <button
                  type="button"
                  onClick={() => setTocOpen(false)}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(197,164,110,0.18)] text-[rgba(245,241,233,0.7)] transition-all hover:border-[rgba(197,164,110,0.35)] hover:text-[#F5F1E9] active:scale-95"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-5">
                <TocList
                  passages={doc.passages}
                  selectedId={selectedId}
                  readIds={readIds}
                  onJump={jumpToPassage}
                />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile / tablet context bottom sheet ────────────────────── */}
      <AnimatePresence>
        {selectedPassage && (
          <div className="xl:hidden">
            <motion.button
              type="button"
              aria-label="Close passage context"
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeContext}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="archive-context-title"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[1.75rem] border border-[rgba(197,164,110,0.16)] border-b-0 bg-[#0C1829] shadow-[0_-24px_64px_rgba(0,0,0,0.5)]"
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduceMotion ? undefined : { y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              drag={reduceMotion ? false : "y"}
              dragControls={sheetDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.55 }}
              onDragEnd={handleSheetDragEnd}
            >
              {/* Drag handle — swipe or tap to dismiss */}
              <div
                className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-3 pb-1 active:cursor-grabbing"
                onPointerDown={(e) => {
                  if (reduceMotion) return;
                  sheetDragControls.start(e);
                }}
              >
                <button
                  type="button"
                  onClick={closeContext}
                  className="group flex w-full flex-col items-center gap-1 py-1"
                  aria-label="Dismiss context panel"
                >
                  <span
                    aria-hidden
                    className="h-1 w-11 rounded-full bg-[rgba(245,241,233,0.18)] transition-colors group-hover:bg-[rgba(197,164,110,0.45)]"
                  />
                  <span className="text-[0.6rem] tracking-[0.16em] text-[rgba(245,241,233,0.28)] uppercase">
                    Swipe down to close
                  </span>
                </button>
              </div>

              <div className="mx-auto min-h-0 w-full max-w-2xl flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-2">
                <div id="archive-context-title" className="sr-only">
                  {selectedPassage.section}
                </div>
                <PassageContext
                  passage={selectedPassage}
                  documentTitle={doc.title}
                  documentSlug={doc.slug}
                  onClose={closeContext}
                  showClose
                  onStudied={handlePassageStudied}
                  onSavedToast={showSavedToast}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global save confirmation — survives passage/panel changes */}
      <SavedToMyLinesToast
        open={saveToast.open}
        subtitle={saveToast.subtitle}
        onDismiss={() =>
          setSaveToast((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}

export default ArchiveDocumentReader;
