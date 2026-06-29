"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProgression } from "@/hooks/use-progression";
import type { Squad } from "@/lib/squads";

async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.status === 401
        ? "Sign in to create or join a platoon."
        : "Empty server response. Try again."
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid server response. Sign in and try again.");
  }
}

export function SquadPanel() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { state, defenderScore, setSquadId } = useProgression();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.squadId || squad) return;

    async function loadSquad(squadId: string) {
      try {
        const res = await fetch(
          `/api/squads?squadId=${encodeURIComponent(squadId)}`
        );
        const data = await readJsonResponse<{ squad?: Squad; error?: string }>(res);
        if (!res.ok) throw new Error(data.error ?? "Failed to load platoon.");
        if (data.squad) setSquad(data.squad);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load platoon.");
      }
    }

    void loadSquad(state.squadId);
  }, [state?.squadId, squad]);

  async function handleCreate() {
    if (!isSignedIn) {
      setError("Sign in to create a platoon.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/squads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          defenderScore,
        }),
      });
      const data = await readJsonResponse<{ squad?: Squad; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Failed to create platoon.");
      if (data.squad) {
        setSquad(data.squad);
        setSquadId(data.squad.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create platoon.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!isSignedIn) {
      setError("Sign in to join a platoon.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/squads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          code,
          defenderScore,
        }),
      });
      const data = await readJsonResponse<{ squad?: Squad; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Failed to join platoon.");
      if (data.squad) {
        setSquad(data.squad);
        setSquadId(data.squad.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join platoon.");
    } finally {
      setLoading(false);
    }
  }

  if (!authLoaded) {
    return (
      <section className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 sm:p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-navy-border/70 bg-navy/40 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-gold" />
        <p className="font-heading text-xs font-semibold tracking-[0.2em] text-gold uppercase">
          Platoons
        </p>
      </div>

      {!isSignedIn ? (
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to create or join a platoon with friends.
          </p>
          <SignInButton mode="redirect" forceRedirectUrl="/">
            <Button className="btn-gold mt-3 min-h-10">Sign in for platoons</Button>
          </SignInButton>
        </div>
      ) : squad ? (
        <div className="mt-3">
          <p className="font-heading text-base font-semibold text-foreground">
            {squad.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Code: <span className="font-mono text-gold">{squad.code}</span> ·{" "}
            {squad.memberIds.length} member{squad.memberIds.length === 1 ? "" : "s"}
            {squad.combinedScore > 0 && (
              <>
                {" "}
                · Combined score:{" "}
                <span className="font-medium text-gold">
                  {squad.combinedScore.toLocaleString()}
                </span>
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Platoon name"
            className="w-full rounded-lg border border-navy-border/80 bg-navy/60 px-3 py-2 text-sm"
          />
          <Button
            disabled={loading || !name.trim()}
            onClick={() => void handleCreate()}
            className="btn-gold w-full min-h-10"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Create platoon"}
          </Button>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Join code"
              className="min-h-10 flex-1 rounded-lg border border-navy-border/80 bg-navy/60 px-3 py-2 text-sm uppercase"
            />
            <Button
              disabled={loading || !code.trim()}
              variant="outline"
              onClick={() => void handleJoin()}
              className="min-h-10"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Join"}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-crimson">{error}</p>}
    </section>
  );
}