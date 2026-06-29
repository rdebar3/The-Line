"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { GuardianCharacter } from "@/components/guardian/guardian-character";
import { PageBackground } from "@/components/rights/page-background";
import { Button } from "@/components/ui/button";
import { writePremiumState } from "@/lib/subscription";

type VerifyState = "loading" | "success" | "error";

export function PurchaseSuccessContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<VerifyState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState("error");
      setError("Sign in to the same account you used at checkout.");
      return;
    }

    if (!sessionId) {
      setState("error");
      setError("No checkout session found.");
      return;
    }

    async function verifyPurchase(id: string) {
      try {
        const response = await fetch(
          `/api/purchase/verify?session_id=${encodeURIComponent(id)}`
        );
        const data = (await response.json()) as {
          purchasedAt?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Verification failed.");
        }

        writePremiumState(data.purchasedAt);
        setState("success");
        window.dispatchEvent(new Event("theline:premium-unlocked"));
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Verification failed.");
      }
    }

    void verifyPurchase(sessionId);
  }, [isLoaded, isSignedIn, sessionId]);

  return (
    <PageBackground>
      <div className="page-shell flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
        {state === "loading" && (
          <>
            <Loader2 className="size-10 animate-spin text-gold" />
            <p className="mt-4 text-sm text-muted-foreground">
              Confirming your purchase...
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <GuardianCharacter mood="neutral" size="lg" floating showLabel />
            <CheckCircle2 className="mt-6 size-12 text-gold" />
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-wide text-foreground">
              Full Experience Unlocked
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Payment confirmed. All scenarios, unlimited counsel, the Arsenal,
              and full passage depth are now yours.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="btn-gold mt-8 min-w-[220px]"
            >
              Return to Hub
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="font-heading text-2xl font-bold tracking-wide text-foreground">
              Something Went Wrong
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {error ?? "We could not verify your purchase."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/sign-in" />}
                className="btn-gold min-w-[220px]"
              >
                Sign In
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/" />}
                variant="outline"
                className="min-w-[220px]"
              >
                Back to Hub
              </Button>
            </div>
          </>
        )}
      </div>
    </PageBackground>
  );
}