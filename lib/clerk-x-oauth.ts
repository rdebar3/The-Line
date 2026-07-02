export const X_OAUTH_STRATEGY = "oauth_x" as const;

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