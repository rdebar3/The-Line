"use client";

import { useCallback, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

import {
  getAbsoluteAppUrl,
  getPostAuthRedirectUrl,
  getSsoCallbackPath,
  type SocialOAuthStrategy,
} from "@/lib/clerk-oauth";

type OAuthMode = "sign-in" | "sign-up";

type UseSocialOAuthRedirectOptions = {
  strategy: SocialOAuthStrategy;
  mode: OAuthMode;
  fallbackErrorMessage: string;
};

function getUserFriendlyOAuthError(
  err: unknown,
  fallbackErrorMessage: string
): string {
  if (err instanceof Error && err.message.includes("still loading")) {
    return err.message;
  }

  if (isClerkAPIResponseError(err)) {
    const code = err.errors[0]?.code;

    if (code === "oauth_access_denied" || code === "external_account_not_found") {
      return "Google sign-in was cancelled or could not be completed. Please try again.";
    }

    if (code === "rate_limit_exceeded") {
      return "Too many attempts. Please wait a moment and try again.";
    }
  }

  return fallbackErrorMessage;
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

    const assignExternalRedirect = (rawUrl: unknown) => {
      const href = toRedirectHref(rawUrl);
      if (!href) return false;

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
          signIn.firstFactorVerification?.externalVerificationRedirectURL
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
          signUp.verifications?.externalAccount?.externalVerificationRedirectURL
        );
      }

      return false;
    };

    const tryAuthenticateWithRedirect = async (): Promise<void> => {
      if (mode === "sign-in" && signIn) {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (mode === "sign-up" && signUp) {
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
      } catch {
        // Fall through to authenticateWithRedirect.
      }

      await tryAuthenticateWithRedirect();
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

      setError(getUserFriendlyOAuthError(err, fallbackErrorMessage));
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