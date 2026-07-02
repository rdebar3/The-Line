"use client";

import { useCallback, useState } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import {
  getPostAuthRedirectUrl,
  getSsoCallbackUrl,
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

function getClerkErrorMessage(
  error: { message?: string; longMessage?: string } | null | undefined
): string {
  if (!error) return "Could not connect to X. Please try again or use email.";
  return (
    error.longMessage ??
    error.message ??
    "Could not connect to X. Please try again or use email."
  );
}

export function SignInWithXButton({
  mode,
  variant = "default",
  className,
}: SignInWithXButtonProps) {
  const clerk = useClerk();
  const { signIn, errors: signInErrors, fetchStatus: signInStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpStatus } = useSignUp();
  const { isOAuthHostile, ready } = useInAppBrowser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy =
    loading ||
    (mode === "sign-in" ? signInStatus === "fetching" : signUpStatus === "fetching");

  const handleClick = useCallback(async () => {
    if (!clerk.loaded || isBusy) return;

    setLoading(true);
    setError(null);

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const redirectUrl = getPostAuthRedirectUrl(searchParams);
    const redirectCallbackUrl = getSsoCallbackUrl(
      mode,
      typeof window !== "undefined" ? window.location.origin : undefined
    );

    try {
      if (mode === "sign-in") {
        const { error: ssoError } = await signIn.sso({
          strategy: X_OAUTH_STRATEGY,
          redirectUrl,
          redirectCallbackUrl,
        });

        if (ssoError) {
          setError(getClerkErrorMessage(ssoError));
          setLoading(false);
        }
        return;
      }

      const { error: ssoError } = await signUp.sso({
        strategy: X_OAUTH_STRATEGY,
        redirectUrl,
        redirectCallbackUrl,
      });

      if (ssoError) {
        setError(getClerkErrorMessage(ssoError));
        setLoading(false);
      }
    } catch {
      setError("Could not connect to X. Please try again or use email.");
      setLoading(false);
    }
  }, [clerk.loaded, isBusy, mode, signIn, signUp]);

  if (ready && isOAuthHostile) return null;

  const hookError =
    mode === "sign-in"
      ? signInErrors?.global?.[0] ?? signInErrors?.raw?.[0]
      : signUpErrors?.global?.[0] ?? signUpErrors?.raw?.[0];
  const displayError = error ?? (hookError ? getClerkErrorMessage(hookError) : null);

  const isCompact = variant === "compact";

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!clerk.loaded || isBusy}
      aria-label="Sign in with X"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-navy-border/80 bg-[#0f1419] font-semibold text-foreground transition-all hover:border-foreground/25 hover:bg-[#161b22] disabled:cursor-not-allowed disabled:opacity-60",
        isCompact
          ? "h-8 px-2.5 text-[0.7rem] sm:h-9 sm:px-3 sm:text-xs"
          : "h-11 w-full px-4 text-sm"
      )}
    >
      <XLogo className={isCompact ? "size-3.5" : "size-4"} />
      <span className={cn(isCompact && "hidden min-[420px]:inline")}>
        {isBusy ? "Connecting…" : "Sign in with X"}
      </span>
    </button>
  );

  if (isCompact) {
    return button;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {button}
      {displayError ? (
        <p className="text-center text-xs text-crimson-light">{displayError}</p>
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