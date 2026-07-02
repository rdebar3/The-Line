"use client";

import { useCallback, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import {
  getOAuthDebugSnapshot,
  logOAuthDebug,
  logOAuthError,
} from "@/lib/clerk-oauth-debug";
import {
  getAbsoluteAppUrl,
  getPostAuthRedirectUrl,
  getSsoCallbackPath,
  type SocialOAuthStrategy,
} from "@/lib/clerk-x-oauth";

type OAuthMode = "sign-in" | "sign-up";

type UseSocialOAuthRedirectOptions = {
  strategy: SocialOAuthStrategy;
  mode: OAuthMode;
  fallbackErrorMessage: string;
};

function getClerkErrorDetails(err: unknown): {
  message: string;
  codes: string[];
} {
  if (isClerkAPIResponseError(err)) {
    const codes = err.errors.map((e) => e.code ?? "unknown");
    const first = err.errors[0];
    return {
      message: first?.longMessage ?? first?.message ?? "Unknown Clerk error",
      codes,
    };
  }

  if (err instanceof Error) {
    return { message: err.message, codes: [] };
  }

  return { message: "Unknown error", codes: [] };
}

function toRedirectHref(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof URL) return value.href;
  if (typeof value === "object" && "href" in value) {
    const href = (value as { href?: unknown }).href;
    return typeof href === "string" ? href : null;
  }
  return String(value);
}

export function useSocialOAuthRedirect({
  strategy,
  mode,
  fallbackErrorMessage,
}: UseSocialOAuthRedirectOptions) {
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = mode === "sign-in" ? signInLoaded : signUpLoaded;

  const startRedirect = useCallback(async () => {
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
    const debug = getOAuthDebugSnapshot(origin);

    logOAuthDebug("oauth_start", {
      force: true,
      strategy,
      mode,
      redirectUrl,
      redirectUrlComplete,
      clerkCallbackUrl: debug.clerkCallbackUrl,
      publishableKeyMode: debug.publishableKeyMode,
    });

    const assignExternalRedirect = (rawUrl: unknown, source: string) => {
      const href = toRedirectHref(rawUrl);
      if (!href) return false;

      logOAuthDebug("oauth_external_redirect", {
        force: true,
        strategy,
        mode,
        source,
        redirectUrl: href,
      });
      window.location.assign(href);
      return true;
    };

    const tryPrepareFlow = async (): Promise<boolean> => {
      if (mode === "sign-in" && signIn) {
        await signIn.create({ strategy, redirectUrl });
        await signIn.prepareFirstFactor({
          strategy,
          redirectUrl,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });

        return assignExternalRedirect(
          signIn.firstFactorVerification?.externalVerificationRedirectURL,
          "signIn.prepareFirstFactor"
        );
      }

      if (mode === "sign-up" && signUp) {
        await signUp.create({
          strategy,
          redirectUrl,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });
        await signUp.prepareVerification({
          strategy,
          redirectUrl,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });

        return assignExternalRedirect(
          signUp.verifications?.externalAccount?.externalVerificationRedirectURL,
          "signUp.prepareVerification"
        );
      }

      return false;
    };

    const tryAuthenticateWithRedirect = async (): Promise<void> => {
      if (mode === "sign-in" && signIn) {
        logOAuthDebug("oauth_authenticate_with_redirect", {
          force: true,
          strategy,
          mode: "sign-in",
          redirectUrl,
          redirectUrlComplete,
        });
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (mode === "sign-up" && signUp) {
        logOAuthDebug("oauth_authenticate_with_redirect", {
          force: true,
          strategy,
          mode: "sign-up",
          redirectUrl,
          redirectUrlComplete,
        });
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      throw new Error("Sign-in is still loading. Please try again.");
    };

    try {
      try {
        const prepared = await tryPrepareFlow();
        if (prepared) return;
      } catch (prepareErr) {
        logOAuthError("oauth_prepare_fallback", prepareErr, {
          strategy,
          mode,
          redirectUrl,
          redirectUrlComplete,
        });
      }

      await tryAuthenticateWithRedirect();
    } catch (err) {
      if (
        isClerkAPIResponseError(err) &&
        err.errors.some((e) => e.code === "session_exists")
      ) {
        const sessionId = clerk.client?.lastActiveSessionId;
        if (sessionId) {
          logOAuthDebug("oauth_session_exists", { force: true, sessionId });
          await clerk.setActive({ session: sessionId });
          window.location.assign(redirectUrlComplete);
          return;
        }
      }

      const { message, codes } = getClerkErrorDetails(err);
      logOAuthError("oauth_failed", err, {
        strategy,
        mode,
        redirectUrl,
        redirectUrlComplete,
        clerkCallbackUrl: debug.clerkCallbackUrl,
        errorCodes: codes,
      });

      const detail =
        codes.length > 0 ? `${message} (${codes.join(", ")})` : message;
      setError(detail || fallbackErrorMessage);
      setLoading(false);
    }
  }, [
    clerk,
    fallbackErrorMessage,
    isReady,
    loading,
    mode,
    signIn,
    signUp,
    strategy,
  ]);

  return { isReady, loading, error, startRedirect, setError };
}