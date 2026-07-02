import { getAppUrl } from "@/lib/app-url";

export const X_OAUTH_STRATEGY = "oauth_x" as const;

export const SIGN_IN_SSO_CALLBACK = "/sign-in/sso-callback";
export const SIGN_UP_SSO_CALLBACK = "/sign-up/sso-callback";

/** Clerk production OAuth callback — must be registered in the X Developer Portal. */
export const CLERK_X_CALLBACK_URL =
  "https://clerk.the-line-eight.vercel.app/v1/oauth_callback";

/** Current Client ID saved in Clerk production (for cross-checking in X portal). */
export const CLERK_X_CLIENT_ID = "RlBFaUU5NTh2WXVCOUVFNFFOdjg6MTpjaQ";

export function getPostAuthRedirectUrl(
  searchParams?: URLSearchParams | null
): string {
  const redirect = searchParams?.get("redirect_url");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
}

export function getSsoCallbackPath(mode: "sign-in" | "sign-up"): string {
  return mode === "sign-in" ? SIGN_IN_SSO_CALLBACK : SIGN_UP_SSO_CALLBACK;
}

export function getAbsoluteAppUrl(path: string, origin?: string): string {
  const base = (origin ?? getAppUrl()).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}