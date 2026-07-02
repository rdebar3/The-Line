"use client";

import { useCallback, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type {
  PrepareFirstFactorParams,
  PrepareVerificationParams,
} from "@clerk/shared/types";

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
  additionalScopes?: string[];
  fallbackErrorMessage: string;
};

function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    return first?.longMessage ?? first?.message ?? fallback;
  }
  return fallback;
}

export function useSocialOAuthRedirect({
  strategy,
  mode,
  additionalScopes = [],
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

    try {
      if (mode === "sign-in" && signIn) {
        if (additionalScopes.length > 0) {
          await signIn.create({ strategy, redirectUrl });
          await signIn.prepareFirstFactor({
            strategy,
            redirectUrl,
            actionCompleteRedirectUrl: redirectUrlComplete,
            additional_scopes: additionalScopes,
          } as PrepareFirstFactorParams);

          const oauthRedirect =
            signIn.firstFactorVerification.externalVerificationRedirectURL;
          if (oauthRedirect) {
            window.location.assign(oauthRedirect);
            return;
          }
        }

        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
        return;
      }

      if (mode === "sign-up" && signUp) {
        if (additionalScopes.length > 0) {
          await signUp.create({
            strategy,
            redirectUrl,
            actionCompleteRedirectUrl: redirectUrlComplete,
          });
          await signUp.prepareVerification({
            strategy,
            redirectUrl,
            actionCompleteRedirectUrl: redirectUrlComplete,
            additional_scopes: additionalScopes,
          } as PrepareVerificationParams);

          const oauthRedirect =
            signUp.verifications.externalAccount.externalVerificationRedirectURL;
          if (oauthRedirect) {
            window.location.assign(oauthRedirect);
            return;
          }
        }

        await signUp.authenticateWithRedirect({
          strategy,
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

      setError(getClerkErrorMessage(err, fallbackErrorMessage));
      setLoading(false);
    }
  }, [
    additionalScopes,
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