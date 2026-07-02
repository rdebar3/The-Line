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
  GOOGLE_OAUTH_STRATEGY,
} from "@/lib/clerk-x-oauth";
import { cn } from "@/lib/utils";

type SignInWithGoogleButtonProps = {
  mode: "sign-in" | "sign-up";
  variant?: "default" | "compact";
  className?: string;
};

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("shrink-0", className)}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getClerkErrorMessage(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    return (
      first?.longMessage ??
      first?.message ??
      "Could not connect to Google. Please try again or use email."
    );
  }
  return "Could not connect to Google. Please try again or use email.";
}

export function SignInWithGoogleButton({
  mode,
  variant = "default",
  className,
}: SignInWithGoogleButtonProps) {
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
          strategy: GOOGLE_OAUTH_STRATEGY,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (mode === "sign-up" && signUp) {
        await signUp.authenticateWithRedirect({
          strategy: GOOGLE_OAUTH_STRATEGY,
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
  const label =
    mode === "sign-in" ? "Sign in with Google" : "Sign up with Google";

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isReady || loading}
      aria-label={label}
      title={error ?? undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-navy-border/60 bg-white font-semibold text-[#3c4043] transition-all hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-60",
        isCompact
          ? "h-8 px-2.5 text-[0.7rem] sm:h-9 sm:px-3 sm:text-xs"
          : "h-11 w-full px-4 text-sm",
        error && isCompact && "border-crimson/50"
      )}
    >
      <GoogleLogo className={isCompact ? "size-3.5" : "size-4"} />
      <span className={cn(isCompact && "hidden min-[420px]:inline")}>
        {loading ? "Connecting…" : label}
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