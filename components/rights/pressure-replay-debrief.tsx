"use client";

import { RotateCcw } from "lucide-react";

import { SourceLinksPanel } from "@/components/rights/source-links-panel";
import { SCENARIO_DISCLAIMER } from "@/lib/legal-disclaimers";
import type { Scenario } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

type ReplayAnswer = {
  scenarioId: string;
  choiceId: string;
  correct: boolean;
};

export function PressureReplayDebrief({
  sessionScenarios,
  answers,
}: {
  sessionScenarios: Scenario[];
  answers: ReplayAnswer[];
}) {
  if (answers.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-navy-border/70 bg-navy/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <RotateCcw className="size-4 text-gold" />
        <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">
          Pressure Replay
        </h3>
      </div>
      <ol className="space-y-4">
        {sessionScenarios.map((scenario, index) => {
          const answer = answers.find((a) => a.scenarioId === scenario.id);
          if (!answer) return null;
          const selected = scenario.choices.find((c) => c.id === answer.choiceId);
          const correct = scenario.choices.find(
            (c) => c.id === scenario.correctChoiceId
          );
          const rememberLine =
            scenario.rememberLine ??
            (answer.correct
              ? scenario.guardianPositive
              : `Hold the line: ${correct?.label ?? scenario.correctChoiceId}`);

          return (
            <li
              key={scenario.id}
              className={cn(
                "rounded-lg border px-4 py-3",
                answer.correct
                  ? "border-gold/25 bg-gold/5"
                  : "border-crimson/25 bg-crimson/5"
              )}
            >
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Question {index + 1} · {answer.correct ? "Held" : "Tested"}
              </p>
              <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                {scenario.title}
              </p>
              {!answer.correct && selected && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You picked: <span className="text-foreground">{selected.label}</span>
                </p>
              )}
              {correct && (
                <p className="mt-1 text-sm text-foreground/90">
                  Strongest line: <span className="font-medium">{correct.label}</span>
                </p>
              )}
              <p className="mt-2 text-sm font-medium text-gold">{rememberLine}</p>
              <div className="mt-3">
                <SourceLinksPanel
                  passageIds={scenario.passageIds}
                  sourceDocument={scenario.sourceDocument}
                />
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">{SCENARIO_DISCLAIMER}</p>
    </section>
  );
}