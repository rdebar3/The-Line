import {
  CLERK_X_CALLBACK_URL,
  SIGN_IN_SSO_CALLBACK,
  SIGN_UP_SSO_CALLBACK,
  getAbsoluteAppUrl,
} from "@/lib/clerk-x-oauth";
import { getAppUrl } from "@/lib/app-url";

export type OAuthDebugSnapshot = {
  environment: "production" | "development" | "unknown";
  appUrl: string;
  origin: string | null;
  clerkCallbackUrl: string;
  signInSsoCallback: string;
  signUpSsoCallback: string;
  publishableKeyMode: "live" | "test" | "missing";
};

export function getClerkKeyMode(): OAuthDebugSnapshot["publishableKeyMode"] {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return "missing";
}

export function getOAuthDebugSnapshot(
  origin?: string | null
): OAuthDebugSnapshot {
  const keyMode = getClerkKeyMode();
  const resolvedOrigin =
    origin ?? (typeof window !== "undefined" ? window.location.origin : null);

  return {
    environment:
      keyMode === "live"
        ? "production"
        : keyMode === "test"
          ? "development"
          : "unknown",
    appUrl: getAppUrl(),
    origin: resolvedOrigin,
    clerkCallbackUrl: CLERK_X_CALLBACK_URL,
    signInSsoCallback: getAbsoluteAppUrl(SIGN_IN_SSO_CALLBACK, resolvedOrigin ?? undefined),
    signUpSsoCallback: getAbsoluteAppUrl(SIGN_UP_SSO_CALLBACK, resolvedOrigin ?? undefined),
    publishableKeyMode: keyMode,
  };
}

type OAuthLogPayload = Record<string, unknown>;

export function logOAuthDebug(
  event: string,
  payload: OAuthLogPayload = {}
): void {
  if (process.env.NODE_ENV === "production" && !payload.force) {
    return;
  }

  console.info(`[The Line OAuth] ${event}`, payload);
}

export function logOAuthError(
  event: string,
  error: unknown,
  payload: OAuthLogPayload = {}
): void {
  const details =
    error && typeof error === "object" && "errors" in error
      ? (error as { errors?: Array<{ code?: string; message?: string }> }).errors
      : undefined;

  console.error(`[The Line OAuth] ${event}`, {
    ...payload,
    error,
    clerkErrors: details,
  });
}