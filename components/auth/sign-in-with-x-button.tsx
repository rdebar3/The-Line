"use client";

import { useCallback, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import {
  getAbsoluteAppUrl,
  getPostAuthRedirectUrl,
  getSsoCallbackPath,
  X_OAUTH_STRATEGY,
} from "@/lib/clerk-x-oauth";
import { cn } from "@/lib/utils";

type SignInWithXButtonProps = {
  mode: "sign-in" | "sign-up";
  variant?: "default" | "compact";
  className?: string;
};

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("shrink-0 fill-current", className)}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function getClerkErrorMessage(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    return (
      first?.longMessage ??
      first?.message ??
      "Could not connect to X. Please try again or use email."
    );
  }
  return "Could not connect to X. Please try again or use email.";
}

export function SignInWithXButton({
  mode,
  variant = "default",
  className,
}: SignInWithXButtonProps) {
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isOAuthHostile, ready } = useInAppBrowser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = mode === "sign-in" ? signInLoaded : signUpLoaded;

  const handleClick = useCallback(async () => {
    if (!isReady || loading) return;

    setLoading(true);
    setError(null);

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const redirectPath = getPostAuthRedirectUrl(searchParams);
    const redirectUrlComplete = getAbsoluteAppUrl(redirectPath, origin);
    const redirectUrl = getAbsoluteAppUrl(getSsoCallbackPath(mode), origin);

    try {
      if (mode === "sign-in" && signIn) {
        await signIn.authenticateWithRedirect({
          strategy: X_OAUTH_STRATEGY,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (mode === "sign-up" && signUp) {
        await signUp.authenticateWithRedirect({
          strategy: X_OAUTH_STRATEGY,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      setError("Sign-in is still loading. Please try again.");
      setLoading(false);
    } catch (err) {
      if (
        isClerkAPIResponseError(err) &&
        err.errors.some((e) => e.code === "session_exists")
      ) {
        const sessionId = clerk.client?.lastActiveSessionId;
        if (sessionId) {
          await clerk.setActive({ session: sessionId });
          window.location.assign(redirectUrlComplete);
          return;
        }
      }

      setError(getClerkErrorMessage(err));
      setLoading(false);
    }
  }, [clerk, isReady, loading, mode, signIn, signUp]);

  if (ready && isOAuthHostile) return null;

  const isCompact = variant === "compact";

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady || loading}
      aria-label="Sign in with X"
      title={error ?? undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-navy-border/80 bg-[#0f1419] font-semibold text-foreground transition-all hover:border-foreground/25 hover:bg-[#161b22] disabled:cursor-not-allowed disabled:opacity-60",
        isCompact
          ? "h-8 px-2.5 text-[0.7rem] sm:h-9 sm:px-3 sm:text-xs"
          : "h-11 w-full px-4 text-sm",
        error && isCompact && "border-crimson/50"
      )}
    >
      <XLogo className={isCompact ? "size-3.5" : "size-4"} />
      <span className={cn(isCompact && "hidden min-[420px]:inline")}>
        {loading ? "Connecting…" : "Sign in with X"}
      </span>
    </button>
  );

  if (isCompact) {
    return button;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {button}
      {error ? (
        <p className="text-center text-xs text-crimson-light">{error}</p>
      ) : null}
    </div>
  );
}

export function AuthEmailDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-navy-border/60" />
      </div>
      <p className="relative mx-auto w-fit bg-navy-elevated/90 px-3 text-xs text-muted-foreground">
        or continue with email
      </p>
    </div>
  );
}