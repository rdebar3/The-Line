"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Landmark,
  Loader2,
  Lock,
  ScrollText,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SaveLineButton } from "@/components/my-lines/save-line-button";
import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";
import {
  buildKeyMoments,
  calculateDefenderScoreAward,
  calculateFidelityScore,
  getFidelityGrade,
  NATIONAL_BANK_DEBATE,
  REPUBLIC_SIMULATOR_ROLES,
  REPUBLIC_SIMULATOR_SCENARIO_ID,
  type RepublicSimulatorChoiceRecord,
} from "@/lib/republic-simulator";
import type {
  RepublicSimulatorHistoricalResponse,
  RepublicSimulatorOutcomeResponse,
} from "@/lib/republic-simulator-grok";
import {
  readRepublicSimulatorDemoUsed,
  writeRepublicSimulatorDemoUsed,
} from "@/lib/republic-simulator-demo";
import { buildRepublicSimulatorLineId } from "@/lib/saved-lines";
import { getRepublicSimulatorAccess } from "@/lib/republic-simulator-access";
import { RepublicSimulatorCapstoneGate } from "@/components/republic-simulator/republic-simulator-capstone-gate";
import {
  FREE_REPUBLIC_SIMULATOR_LIMIT,
  PREMIUM_PRICE_LABEL,
  UNLOCK_CTA_LABEL,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type SimulatorPhase = "intro" | "role" | "decision" | "outcome" | "final";

type OutcomeState = RepublicSimulatorOutcomeResponse & {
  historical?: RepublicSimulatorHistoricalResponse | null;
  showHistorical: boolean;
  loadingHistorical: boolean;
};

export function RepublicSimulatorExperience() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isPremium, isLoading: subscriptionLoading, openUnlockModal } =
    useSubscription();
  const { state, isLoaded: progressionLoaded, completeRepublicSimulator, defenderScore } =
    useProgression();

  const [phase, setPhase] = useState<SimulatorPhase>("intro");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [records, setRecords] = useState<RepublicSimulatorChoiceRecord[]>([]);
  const [outcomes, setOutcomes] = useState<RepublicSimulatorOutcomeResponse[]>(
    []
  );
  const [outcome, setOutcome] = useState<OutcomeState | null>(null);
  const [loadingOutcome, setLoadingOutcome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [demoUsed, setDemoUsed] = useState(readRepublicSimulatorDemoUsed);

  const scenario = NATIONAL_BANK_DEBATE;
  const currentDecision = scenario.decisions[decisionIndex];
  const selectedRole = REPUBLIC_SIMULATOR_ROLES.find((role) => role.id === roleId);

  const access = useMemo(() => {
    if (!state) {
      return {
        canPlay: false,
        reason: "capstone_incomplete" as const,
        capstoneComplete: false,
        premiumOrDemoAvailable: false,
      };
    }
    return getRepublicSimulatorAccess(state, isPremium, demoUsed);
  }, [demoUsed, isPremium, state]);

  const fidelityScore = useMemo(
    () => calculateFidelityScore(records),
    [records]
  );

  const fidelityGrade = getFidelityGrade(fidelityScore);

  const fetchOutcome = useCallback(
    async (choiceId: string, choiceLabel: string) => {
      if (!currentDecision || !roleId) return;

      setLoadingOutcome(true);
      setError(null);
      setPhase("outcome");

      try {
        if (!isSignedIn) {
          throw new Error("Sign in required for Grok counsel.");
        }

        const response = await fetch("/api/grok/republic-simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "outcome",
            scenarioId: scenario.id,
            roleId,
            decisionId: currentDecision.id,
            choiceId,
            choiceLabel,
            decisionIndex,
            totalDecisions: scenario.decisions.length,
          }),
        });

        const data = (await response.json()) as RepublicSimulatorOutcomeResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load outcome.");
        }

        setOutcome({
          ...data,
          showHistorical: false,
          loadingHistorical: false,
          historical: null,
        });
        setOutcomes((prev) => [...prev, data]);

        if (!isPremium && decisionIndex === 0) {
          writeRepublicSimulatorDemoUsed();
          setDemoUsed(true);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load outcome."
        );
      } finally {
        setLoadingOutcome(false);
      }
    },
    [
      currentDecision,
      decisionIndex,
      isPremium,
      isSignedIn,
      roleId,
      scenario.decisions.length,
      scenario.id,
    ]
  );

  async function handleChoice(choiceId: string, choiceLabel: string) {
    if (!currentDecision) return;

    const choice = currentDecision.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    setRecords((prev) => [
      ...prev,
      {
        decisionId: currentDecision.id,
        decisionTitle: currentDecision.title,
        choiceId,
        choiceLabel,
        fidelityScore: choice.fidelityScore,
      },
    ]);

    await fetchOutcome(choiceId, choiceLabel);
  }

  async function toggleHistoricalReality() {
    if (!outcome || !currentDecision) return;

    if (outcome.showHistorical) {
      setOutcome({ ...outcome, showHistorical: false });
      return;
    }

    if (outcome.historical) {
      setOutcome({ ...outcome, showHistorical: true });
      return;
    }

    const lastRecord = records[records.length - 1];
    if (!lastRecord) return;

    setOutcome({ ...outcome, loadingHistorical: true });

    try {
      const response = await fetch("/api/grok/republic-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "historical-reality",
          scenarioId: scenario.id,
          decisionId: lastRecord.decisionId,
          choiceId: lastRecord.choiceId,
        }),
      });

      const data = (await response.json()) as RepublicSimulatorHistoricalResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load historical record.");
      }

      setOutcome({
        ...outcome,
        historical: data,
        showHistorical: true,
        loadingHistorical: false,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load historical record."
      );
      setOutcome({ ...outcome, loadingHistorical: false });
    }
  }

  function handleContinueFromOutcome() {
    if (decisionIndex >= scenario.decisions.length - 1) {
      const score = calculateFidelityScore(records);
      const points = calculateDefenderScoreAward(score);
      setPointsEarned(points);
      completeRepublicSimulator?.({
        scenarioId: scenario.id,
        roleId: roleId ?? "madison",
        fidelityScore: score,
        pointsEarned: points,
      });
      setPhase("final");
      return;
    }

    setDecisionIndex((index) => index + 1);
    setOutcome(null);
    setPhase("decision");
  }

  function resetSimulator() {
    setPhase("intro");
    setRoleId(null);
    setDecisionIndex(0);
    setRecords([]);
    setOutcomes([]);
    setOutcome(null);
    setPointsEarned(0);
    setError(null);
  }

  const keyMoments = buildKeyMoments(records, outcomes);

  if (!authLoaded || subscriptionLoading || !progressionLoaded || !state) {
    return (
      <div className="animate-pulse rounded-2xl border border-navy-border/60 bg-navy-elevated/40 p-12 text-center">
        <p className="text-sm text-muted-foreground">Loading simulator…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gold/25 bg-navy-elevated/60 p-8 text-center">
        <Landmark className="mx-auto size-10 text-gold" />
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          Sign In to Enter the Chamber
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The Republic Simulator capstone unlocks after you certify all three
          founding document units. Sign in to track your path and enter the
          chamber when you&apos;re cleared.
        </p>
        <Link
          href="/sign-in?redirect_url=/path/simulator"
          className="btn-gold btn-cta mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!access.canPlay && phase === "intro") {
    if (access.reason === "capstone_incomplete") {
      return <RepublicSimulatorCapstoneGate state={state} />;
    }

    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-navy-elevated/60 p-8 text-center">
        <Lock className="mx-auto size-10 text-gold" />
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          Full Access Required
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You&apos;ve cleared the training path capstone and used your{" "}
          {FREE_REPUBLIC_SIMULATOR_LIMIT} free Republic Simulator scenario.
          Unlock Full Access for unlimited historical decision-making —{" "}
          {PREMIUM_PRICE_LABEL} one-time.
        </p>
        <Button onClick={openUnlockModal} className="btn-gold btn-cta mt-6 w-full">
          {UNLOCK_CTA_LABEL}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="Capstone Challenge"
        title="Republic Simulator"
        description={`${scenario.subtitle} Your final test after certifying the Declaration, Constitution, and Bill of Rights.`}
        className="animate-fade-up border-b border-gold/15 pb-5 sm:pb-6"
      />

      {phase === "intro" && (
        <IntroPanel
          scenarioSummary={scenario.summary}
          onBegin={() => setPhase("role")}
          isPremium={isPremium}
          demoAvailable={!demoUsed}
        />
      )}

      {phase === "role" && (
        <RoleSelectionPanel
          onSelect={(id) => {
            setRoleId(id);
            setPhase("decision");
          }}
        />
      )}

      {phase === "decision" && currentDecision && selectedRole && (
        <DecisionPanel
          key={currentDecision.id}
          role={selectedRole}
          decision={currentDecision}
          decisionIndex={decisionIndex}
          totalDecisions={scenario.decisions.length}
          onChoose={handleChoice}
          disabled={loadingOutcome}
        />
      )}

      {phase === "outcome" && (
        <OutcomePanel
          key={`outcome-${decisionIndex}`}
          outcome={outcome}
          loading={loadingOutcome}
          error={error}
          decisionIndex={decisionIndex}
          totalDecisions={scenario.decisions.length}
          onToggleHistorical={toggleHistoricalReality}
          onContinue={handleContinueFromOutcome}
        />
      )}

      {phase === "final" && (
        <FinalResultsPanel
          fidelityScore={fidelityScore}
          fidelityGrade={fidelityGrade}
          pointsEarned={pointsEarned}
          totalScore={defenderScore}
          records={records}
          keyMoments={keyMoments}
          scenarioId={REPUBLIC_SIMULATOR_SCENARIO_ID}
          onReplay={isPremium ? resetSimulator : undefined}
          onHub={() => resetSimulator()}
        />
      )}
    </div>
  );
}

const CHOICE_LETTERS = ["A", "B", "C", "D"] as const;

function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-in fade-in slide-in-from-bottom-2 duration-500", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

function ParchmentCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-[#2f281c]/90 via-[#1e2438]/95 to-navy/98 shadow-[0_12px_48px_rgba(10,15,28,0.5),inset_0_1px_0_rgba(201,162,39,0.12)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 0%, rgba(201,162,39,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(139,38,53,0.08) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(201,162,39,0.22) 32px)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crimson/30 to-transparent"
      />
      <div className="relative p-5 sm:p-8">{children}</div>
    </div>
  );
}

function IntroPanel({
  scenarioSummary,
  onBegin,
  isPremium,
  demoAvailable,
}: {
  scenarioSummary: string;
  onBegin: () => void;
  isPremium: boolean;
  demoAvailable: boolean;
}) {
  return (
    <FadeInSection>
    <ParchmentCard>
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-constitution-blue/35 bg-constitution-blue/15">
          <Landmark className="size-7 text-constitution-blue-light" />
        </span>
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase">
            Final Capstone Challenge
          </p>
          <p className="mt-3 font-serif text-base leading-relaxed text-foreground/90 sm:text-lg">
            {scenarioSummary}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "5 constitutional decision points",
          "Grok Founder counsel & analysis",
          "Historical reality with real quotes",
        ].map((item) => (
          <li
            key={item}
            className="rounded-xl border border-navy-border/50 bg-navy/35 px-4 py-3 text-sm text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>

      {!isPremium && demoAvailable && (
        <p className="mt-5 rounded-lg border border-gold/20 bg-gold/[0.06] px-4 py-3 text-center text-xs text-muted-foreground">
          <span className="font-semibold text-gold">Capstone cleared.</span> Play
          this scenario once on the free tier, or unlock Full Access for
          unlimited chamber sessions.
        </p>
      )}

      <Button onClick={onBegin} className="btn-gold btn-cta mt-6 h-12 w-full sm:w-auto sm:min-w-[240px]">
        Enter the Chamber
        <ArrowRight className="size-4" />
      </Button>
    </ParchmentCard>
    </FadeInSection>
  );
}

function RoleSelectionPanel({
  onSelect,
}: {
  onSelect: (roleId: string) => void;
}) {
  return (
    <FadeInSection className="space-y-4 sm:space-y-5">
      <header className="text-center">
        <p className="section-eyebrow">Step 1</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
          Choose Your Role
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Step into the First Congress as a defender of republican government.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {REPUBLIC_SIMULATOR_ROLES.map((role, index) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            className="group rounded-2xl border border-gold/25 bg-navy-elevated/60 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)] sm:p-6"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="font-heading text-xs font-semibold tracking-[0.22em] text-gold uppercase">
              {role.perspective}
            </p>
            <h3 className="mt-3 font-heading text-xl font-bold text-foreground">
              {role.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {role.title}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {role.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
              Assume this role
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>
    </FadeInSection>
  );
}

function ChoiceOptionButton({
  letter,
  label,
  summary,
  index,
  disabled,
  onClick,
}: {
  letter: string;
  label: string;
  summary: string;
  index: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const accentRing =
    index % 2 === 0
      ? "hover:shadow-[0_0_28px_rgba(201,162,39,0.2)] hover:border-gold/65"
      : "hover:shadow-[0_0_28px_rgba(139,38,53,0.15)] hover:border-crimson/40";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-xl border-2 border-gold/25 bg-navy-elevated/75 p-4 text-left transition-all duration-300 sm:p-5",
        "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        accentRing,
        disabled && "pointer-events-none opacity-55"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="flex items-start gap-3 sm:gap-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gradient-to-b from-gold/20 to-gold/5 font-heading text-sm font-bold text-gold shadow-[0_0_12px_rgba(201,162,39,0.15)] transition-all group-hover:border-gold/60 group-hover:shadow-[0_0_16px_rgba(201,162,39,0.25)] sm:size-10 sm:text-base">
          {letter}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-snug text-foreground sm:text-base">
            {label}
          </span>
          <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {summary}
          </span>
        </span>
        <ChevronRight className="mt-1 size-4 shrink-0 text-gold/50 transition-all group-hover:translate-x-0.5 group-hover:text-gold" />
      </span>
    </button>
  );
}

function DecisionPanel({
  role,
  decision,
  decisionIndex,
  totalDecisions,
  onChoose,
  disabled,
}: {
  role: (typeof REPUBLIC_SIMULATOR_ROLES)[number];
  decision: (typeof NATIONAL_BANK_DEBATE.decisions)[number];
  decisionIndex: number;
  totalDecisions: number;
  onChoose: (choiceId: string, label: string) => void;
  disabled: boolean;
}) {
  return (
    <FadeInSection className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3 text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:text-xs">
        <span>
          Decision {decisionIndex + 1} of {totalDecisions}
        </span>
        <span className="text-gold">{role.name}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-navy-border/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-crimson via-gold to-constitution-blue transition-all duration-500 shadow-[0_0_8px_rgba(201,162,39,0.35)]"
          style={{
            width: `${((decisionIndex + 1) / totalDecisions) * 100}%`,
          }}
        />
      </div>

      <ParchmentCard>
        <p className="font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase">
          {decision.title}
        </p>
        <p className="mt-3 font-serif text-[0.95rem] leading-[1.8] text-foreground/92 sm:mt-4 sm:text-lg sm:leading-[1.85]">
          {decision.situation}
        </p>
      </ParchmentCard>

      <div className="space-y-2.5 sm:space-y-3">
        <p className="px-0.5 text-center text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase sm:text-xs">
          Your Decision
        </p>
        {decision.choices.map((choice, index) => (
          <FadeInSection key={choice.id} delay={index * 60} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <ChoiceOptionButton
              letter={CHOICE_LETTERS[index] ?? String(index + 1)}
              label={choice.label}
              summary={choice.summary}
              index={index}
              disabled={disabled}
              onClick={() => onChoose(choice.id, choice.label)}
            />
          </FadeInSection>
        ))}
      </div>
    </FadeInSection>
  );
}

function OutcomePanel({
  outcome,
  loading,
  error,
  decisionIndex,
  totalDecisions,
  onToggleHistorical,
  onContinue,
}: {
  outcome: OutcomeState | null;
  loading: boolean;
  error: string | null;
  decisionIndex: number;
  totalDecisions: number;
  onToggleHistorical: () => void;
  onContinue: () => void;
}) {
  return (
    <FadeInSection className="space-y-4 sm:space-y-5">
      <header className="text-center">
        <p className="section-eyebrow">Grok Counsel</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-2xl">
          Immediate Outcome
        </h2>
      </header>

      {loading && (
        <ParchmentCard className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-gold" />
          <p className="mt-4 text-sm text-muted-foreground">
            Consulting the Founding record…
          </p>
        </ParchmentCard>
      )}

      {error && !loading && (
        <ParchmentCard>
          <p className="text-sm text-crimson-light">{error}</p>
        </ParchmentCard>
      )}

      {outcome && !loading && (
        <>
          <FadeInSection delay={0}>
            <ParchmentCard>
              <p className="font-heading text-xs font-semibold tracking-[0.22em] text-crimson-light uppercase">
                What Happens Next
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/92 sm:text-base sm:leading-relaxed">
                {outcome.immediateResult}
              </p>

              <div className="mt-5 border-t border-gold/20 pt-5 sm:mt-6 sm:pt-6">
                <p className="font-heading text-xs font-semibold tracking-[0.22em] text-constitution-blue-light uppercase">
                  Constitutional Analysis
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {outcome.constitutionalAnalysis}
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-transparent px-4 py-4 sm:mt-6 sm:px-5 sm:py-5">
                <p className="font-heading text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                  Founder&apos;s Voice
                </p>
                <p className="mt-3 font-serif text-sm italic leading-relaxed text-foreground/88 sm:text-base">
                  &ldquo;{outcome.founderVoice}&rdquo;
                </p>
              </div>
            </ParchmentCard>
          </FadeInSection>

          <FadeInSection delay={120}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <Button
                type="button"
                onClick={onToggleHistorical}
                disabled={outcome.loadingHistorical}
                className="btn-gold btn-cta h-11 flex-1 shadow-[0_0_20px_rgba(201,162,39,0.15)]"
              >
                {outcome.loadingHistorical ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookOpen className="size-4" />
                )}
                {outcome.showHistorical
                  ? "Hide Historical Reality"
                  : "What Actually Happened"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onContinue}
                className="h-11 flex-1 border-gold/30 bg-navy-elevated/50 font-semibold text-foreground hover:border-gold/45 hover:bg-gold/[0.06]"
              >
                {decisionIndex >= totalDecisions - 1
                  ? "View Final Results"
                  : "Next Decision"}
                <ChevronRight className="size-4 text-gold" />
              </Button>
            </div>
          </FadeInSection>

          {outcome.showHistorical && outcome.historical && (
            <FadeInSection delay={0}>
              <ParchmentCard>
                <p className="font-heading text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                  Historical Reality
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {outcome.historical.whatActuallyHappened}
                </p>
                <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                  {outcome.historical.quotes.map((quote) => (
                    <li
                      key={`${quote.speaker}-${quote.source}`}
                      className="rounded-xl border border-gold/15 bg-navy/40 px-4 py-3 sm:py-4"
                    >
                      <p className="font-serif text-sm italic leading-relaxed text-foreground/90 sm:text-base">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      <p className="mt-2 text-xs font-semibold text-gold">
                        — {quote.speaker}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {quote.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </ParchmentCard>
            </FadeInSection>
          )}
        </>
      )}
    </FadeInSection>
  );
}

function FinalResultsPanel({
  fidelityScore,
  fidelityGrade,
  pointsEarned,
  totalScore,
  records,
  keyMoments,
  scenarioId,
  onReplay,
  onHub,
}: {
  fidelityScore: number;
  fidelityGrade: ReturnType<typeof getFidelityGrade>;
  pointsEarned: number;
  totalScore: number;
  records: RepublicSimulatorChoiceRecord[];
  keyMoments: ReturnType<typeof buildKeyMoments>;
  scenarioId: string;
  onReplay?: () => void;
  onHub: () => void;
}) {
  return (
    <FadeInSection className="space-y-5 sm:space-y-6">
      <ParchmentCard className="text-center">
        <Sparkles className="mx-auto size-8 text-gold" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Scenario Complete
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The National Bank Debate — your record is entered in the Defender ledger.
        </p>

        <div className="mx-auto mt-8 grid max-w-md gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gold/30 bg-gold/[0.08] px-4 py-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
              Fidelity Score
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-gold">
              {fidelityScore}
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground/80">
              {fidelityGrade.label}
            </p>
          </div>
          <div className="rounded-xl border border-crimson/25 bg-crimson/[0.08] px-4 py-5">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-crimson-light uppercase">
              Defender Score
            </p>
            <p className="mt-2 font-heading text-4xl font-bold text-foreground">
              +{pointsEarned}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total: {totalScore.toLocaleString()}
            </p>
          </div>
        </div>
      </ParchmentCard>

      <ParchmentCard>
        <p className="font-heading text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Your Choices
        </p>
        <ul className="mt-4 space-y-3">
          {records.map((record) => (
            <li
              key={record.decisionId}
              className="rounded-xl border border-navy-border/50 bg-navy/35 px-4 py-3"
            >
              <p className="text-sm font-semibold text-foreground">
                {record.decisionTitle}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {record.choiceLabel}
              </p>
              <p className="mt-1 text-xs font-medium text-gold">
                Fidelity {record.fidelityScore}/100
              </p>
            </li>
          ))}
        </ul>
      </ParchmentCard>

      <ParchmentCard>
        <div className="flex items-center gap-3">
          <ScrollText className="size-5 text-gold" />
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              Save Key Moments to My Lines
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep constitutional insights from your decisions.
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {keyMoments.map((moment) => (
            <li
              key={moment.id}
              className="rounded-xl border border-navy-border/50 bg-navy/35 px-4 py-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {moment.title}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {moment.passageText}
              </p>
              <div className="mt-3">
                <SaveLineButton
                  variant="compact"
                  draft={{
                    id: buildRepublicSimulatorLineId(scenarioId, moment.id),
                    source: "republic-simulator",
                    passageText: moment.passageText,
                    title: moment.title,
                    subtitle: moment.subtitle,
                    scenarioId: `${scenarioId}:${moment.id}`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </ParchmentCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {onReplay && (
          <Button onClick={onReplay} variant="outline" className="h-11 px-6">
            Play Again
          </Button>
        )}
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          onClick={onHub}
          className="btn-gold h-11 px-6"
        >
          Return to Hub
        </Button>
      </div>
    </FadeInSection>
  );
}