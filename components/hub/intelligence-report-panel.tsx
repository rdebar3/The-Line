"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  Brain,
  Loader2,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { Button } from "@/components/ui/button";
import { useAdaptiveIntelligence } from "@/hooks/use-adaptive-intelligence";
import { useSubscription } from "@/hooks/use-subscription";
import { CHARACTER_NAME } from "@/lib/guardian";
import { ADAPTIVE_MISSION_LIMITS } from "@/lib/adaptive-intelligence";
import { cn } from "@/lib/utils";

function WeakAreaBar({
  label,
  accuracy,
  rank,
}: {
  label: string;
  accuracy: number;
  rank: number;
}) {
  return (
    <div className="rounded-xl border border-navy-border/70 bg-navy/45 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-xs font-semibold tracking-wide text-foreground">
            <span className="text-gold">#{rank}</span>
            {label}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 font-heading text-lg font-bold",
            accuracy < 60 ? "text-crimson" : accuracy < 80 ? "text-gold" : "text-foreground"
          )}
        >
          {accuracy}%
        </span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-navy-border/50">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            accuracy < 60
              ? "bg-gradient-to-r from-crimson to-crimson-hover"
              : accuracy < 80
                ? "bg-gradient-to-r from-gold/80 to-gold"
                : "progress-bar-gold"
          )}
          style={{ width: `${Math.max(accuracy, 4)}%` }}
        />
      </div>
    </div>
  );
}

export function IntelligenceReportPanel() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { openUnlockModal } = useSubscription();
  const {
    isLoaded,
    report,
    missionAccess,
    scenarioCount,
    isPremium,
    hasActiveMission,
    isGenerating,
    error,
    generateMission,
    clearError,
  } = useAdaptiveIntelligence();

  async function handleGenerateMission() {
    clearError();
    const result = await generateMission();
    if (result.success) {
      router.push("/adaptive-mission");
    }
  }

  if (!isLoaded || !report) {
    return (
      <div className="hub-card-shell animate-pulse">
        <div className="relative p-8">
          <div className="mx-auto h-6 w-48 rounded bg-navy-border/40" />
          <div className="mx-auto mt-6 h-24 w-full max-w-lg rounded-xl bg-navy-border/30" />
        </div>
      </div>
    );
  }

  const displayWeakAreas =
    report.weakAreas.length > 0
      ? report.weakAreas
      : [
          {
            topicId: "consent-governed",
            label: "Consent of the Governed",
            description: "Start training to build your profile",
            accuracy: 0,
            total: 0,
            correct: 0,
          },
          {
            topicId: "4th-amendment",
            label: "4th Amendment",
            description: "Start training to build your profile",
            accuracy: 0,
            total: 0,
            correct: 0,
          },
          {
            topicId: "due-process",
            label: "Due Process",
            description: "Start training to build your profile",
            accuracy: 0,
            total: 0,
            correct: 0,
          },
        ].slice(0, 3);

  return (
    <div className="hub-card-shell shadow-[0_0_50px_rgba(201,162,39,0.06)]">
      <div aria-hidden className="hub-card-accent" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.08)_0%,transparent_55%)]"
      />

      <div className="relative p-4 sm:p-8">
        <header className="hub-section-header sm:mb-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="section-eyebrow flex items-center justify-center gap-2 sm:justify-start">
                <Brain className="size-4 text-gold" />
                Intelligence Report
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold tracking-wide text-foreground sm:text-2xl">
                {CHARACTER_NAME}&apos;s Assessment
              </h2>
              <p className="hub-section-subtitle mt-2">
                Adaptive analysis of your constitutional training — weak areas
                targeted, strengths reinforced.
              </p>
            </div>
            <GuardianCharacter
              mood="thinking"
              size="md"
              floating
              showLabel={false}
            />
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase">
              Tracked Answers
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {report.totalAnswered}
            </p>
          </div>
          <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 text-center">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Topic Accuracy
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {report.overallAccuracy}%
            </p>
          </div>
          <div className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 text-center">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Mission Size
            </p>
            <p className="mt-2 font-heading text-3xl font-bold text-foreground">
              {scenarioCount}
              <span className="ml-1 text-base font-medium text-muted-foreground">
                scenarios
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 flex items-center gap-2 font-heading text-xs font-semibold tracking-[0.2em] text-crimson uppercase">
            <TrendingDown className="size-3.5" />
            Priority Weak Areas
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayWeakAreas.map((area, index) => (
              <WeakAreaBar
                key={area.topicId}
                label={area.label}
                accuracy={area.accuracy}
                rank={index + 1}
              />
            ))}
          </div>
          {!report.hasEnoughData && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Complete a few training scenarios to sharpen this assessment.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-crimson">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {!authLoaded || !isSignedIn ? (
            <Button
              nativeButton={false}
              render={<Link href="/sign-in" />}
              className="btn-crimson btn-cta h-12 w-full max-w-md rounded-xl sm:w-auto"
            >
              Sign In to Generate Mission
            </Button>
          ) : hasActiveMission ? (
            <Button
              nativeButton={false}
              render={<Link href="/adaptive-mission" />}
              className="btn-crimson btn-cta h-12 w-full max-w-md rounded-xl sm:w-auto"
            >
              <Target className="size-4" />
              Continue Personalized Mission
            </Button>
          ) : (
            <Button
              onClick={() => void handleGenerateMission()}
              disabled={isGenerating || !missionAccess.allowed}
              className="btn-crimson btn-cta h-12 w-full max-w-md rounded-xl sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {CHARACTER_NAME} is composing your mission...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Personalized Mission
                </>
              )}
            </Button>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {isPremium ? (
            <>
              Premium: up to {ADAPTIVE_MISSION_LIMITS.premiumScenariosPerMission}{" "}
              progressive scenarios · {missionAccess.remaining} missions left today
            </>
          ) : (
            <>
              Free: {ADAPTIVE_MISSION_LIMITS.freeScenariosPerMission} scenarios per
              mission · {missionAccess.remaining} mission/day
              {!isPremium && (
                <>
                  {" "}
                  ·{" "}
                  <button
                    type="button"
                    onClick={openUnlockModal}
                    className="text-gold underline-offset-2 hover:underline"
                  >
                    Unlock deeper missions
                  </button>
                </>
              )}
            </>
          )}
        </p>

        {!missionAccess.allowed && missionAccess.reason && !hasActiveMission && (
          <p className="mt-2 text-center text-xs text-gold/90">
            {missionAccess.reason}
          </p>
        )}
      </div>
    </div>
  );
}