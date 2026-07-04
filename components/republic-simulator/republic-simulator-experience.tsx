"use client";

import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
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
import {
  canAccessRepublicSimulator,
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
  const { completeRepublicSimulator, defenderScore } = useProgression();

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

  const canPlay = useMemo(
    () => canAccessRepublicSimulator(isPremium, demoUsed),
    [demoUsed, isPremium]
  );

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

  if (!authLoaded || subscriptionLoading) {
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
          Republic Simulator uses Grok counsel grounded in Founding-era sources.
          Sign in to play your free demo scenario.
        </p>
        <SignInButton mode="redirect">
          <Button className="btn-gold btn-cta mt-6 w-full">Sign In</Button>
        </SignInButton>
      </div>
    );
  }

  if (!canPlay && phase === "intro") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-navy-elevated/60 p-8 text-center">
        <Lock className="mx-auto size-10 text-gold" />
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          Demo Complete
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You&apos;ve used your {FREE_REPUBLIC_SIMULATOR_LIMIT} free Republic
          Simulator scenario. Unlock Full Access for unlimited historical
          decision-making — {PREMIUM_PRICE_LABEL} one-time.
        </p>
        <Button onClick={openUnlockModal} className="btn-gold btn-cta mt-6 w-full">
          {UNLOCK_CTA_LABEL}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Republic Simulator"
        title={scenario.title}
        description={scenario.subtitle}
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
        "relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-b from-[#2a2318]/80 via-navy-elevated/90 to-navy/95 shadow-[0_12px_48px_rgba(10,15,28,0.45)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(201,162,39,0.4) 29px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      <div className="relative p-6 sm:p-8">{children}</div>
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
    <ParchmentCard>
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-constitution-blue/35 bg-constitution-blue/15">
          <Landmark className="size-7 text-constitution-blue-light" />
        </span>
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase">
            Interactive Decision-Making
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
          <span className="font-semibold text-gold">Free demo</span> — play this
          scenario once. Unlock for unlimited Republic Simulator access.
        </p>
      )}

      <Button onClick={onBegin} className="btn-gold btn-cta mt-6 h-12 w-full sm:w-auto sm:min-w-[240px]">
        Enter the Chamber
        <ArrowRight className="size-4" />
      </Button>
    </ParchmentCard>
  );
}

function RoleSelectionPanel({
  onSelect,
}: {
  onSelect: (roleId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <header className="text-center">
        <p className="section-eyebrow">Step 1</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
          Choose Your Role
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Step into the First Congress as a defender of republican government.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPUBLIC_SIMULATOR_ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            className="group rounded-2xl border border-gold/20 bg-navy-elevated/60 p-6 text-left transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_8px_40px_rgba(201,162,39,0.12)]"
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
    </div>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        <span>
          Decision {decisionIndex + 1} of {totalDecisions}
        </span>
        <span className="text-gold">{role.name}</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-navy-border/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-crimson via-gold to-constitution-blue transition-all duration-500"
          style={{
            width: `${((decisionIndex + 1) / totalDecisions) * 100}%`,
          }}
        />
      </div>

      <ParchmentCard>
        <p className="font-heading text-xs font-semibold tracking-[0.28em] text-gold uppercase">
          {decision.title}
        </p>
        <p className="mt-4 font-serif text-base leading-[1.85] text-foreground/90 sm:text-lg">
          {decision.situation}
        </p>
      </ParchmentCard>

      <div className="grid gap-3">
        {decision.choices.map((choice) => (
          <Button
            key={choice.id}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(choice.id, choice.label)}
            className="h-auto min-h-[3.5rem] w-full justify-start rounded-xl border border-navy-border/70 bg-navy-elevated/70 px-5 py-4 text-left text-sm font-medium leading-snug text-foreground hover:border-gold/35 hover:bg-gold/[0.06] disabled:opacity-60"
            variant="outline"
          >
            <span className="block">{choice.label}</span>
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {choice.summary}
            </span>
          </Button>
        ))}
      </div>
    </div>
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
    <div className="space-y-5">
      <header className="text-center">
        <p className="section-eyebrow">Grok Counsel</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
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
          <p className="text-sm text-crimson">{error}</p>
        </ParchmentCard>
      )}

      {outcome && !loading && (
        <>
          <ParchmentCard>
            <p className="font-heading text-xs font-semibold tracking-[0.22em] text-crimson-light uppercase">
              What Happens Next
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {outcome.immediateResult}
            </p>

            <div className="mt-6 border-t border-gold/15 pt-6">
              <p className="font-heading text-xs font-semibold tracking-[0.22em] text-constitution-blue-light uppercase">
                Constitutional Analysis
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {outcome.constitutionalAnalysis}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.05] px-5 py-5">
              <p className="font-heading text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Founder&apos;s Voice
              </p>
              <p className="mt-3 font-serif text-base italic leading-relaxed text-foreground/85">
                &ldquo;{outcome.founderVoice}&rdquo;
              </p>
            </div>
          </ParchmentCard>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onToggleHistorical}
              disabled={outcome.loadingHistorical}
              className="h-11 flex-1 border-gold/30 text-gold hover:bg-gold/10"
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
              onClick={onContinue}
              className="btn-gold btn-cta h-11 flex-1"
            >
              {decisionIndex >= totalDecisions - 1
                ? "View Final Results"
                : "Next Decision"}
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {outcome.showHistorical && outcome.historical && (
            <ParchmentCard>
              <p className="font-heading text-xs font-semibold tracking-[0.22em] text-gold uppercase">
                Historical Reality
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {outcome.historical.whatActuallyHappened}
              </p>
              <ul className="mt-5 space-y-4">
                {outcome.historical.quotes.map((quote) => (
                  <li
                    key={`${quote.speaker}-${quote.source}`}
                    className="rounded-xl border border-navy-border/50 bg-navy/40 px-4 py-4"
                  >
                    <p className="font-serif text-base italic leading-relaxed text-foreground/90">
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
          )}
        </>
      )}
    </div>
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
    <div className="space-y-6">
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
    </div>
  );
}