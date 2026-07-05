import { getAppUrl } from "@/lib/app-url";

export const GOOGLE_OAUTH_STRATEGY = "oauth_google" as const;

export type SocialOAuthStrategy = typeof GOOGLE_OAUTH_STRATEGY;

export const SIGN_IN_SSO_CALLBACK = "/sign-in/sso-callback";
export const SIGN_UP_SSO_CALLBACK = "/sign-up/sso-callback";

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