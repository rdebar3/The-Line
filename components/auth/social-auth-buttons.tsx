"use client";

import {
  AuthEmailDivider,
  SignInWithXButton,
} from "@/components/auth/sign-in-with-x-button";
import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";
import { XOAuthTroubleshoot } from "@/components/auth/x-oauth-troubleshoot";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { X_SIGN_IN_UI_ENABLED } from "@/lib/clerk-x-oauth";

type SocialAuthButtonsProps = {
  mode: "sign-in" | "sign-up";
  showTroubleshoot?: boolean;
  onEmailFallback?: () => void;
};

export function SocialAuthButtons({
  mode,
  showTroubleshoot = mode === "sign-in",
  onEmailFallback,
}: SocialAuthButtonsProps) {
  const { isOAuthHostile, ready } = useInAppBrowser();

  if (ready && isOAuthHostile) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SignInWithGoogleButton mode={mode} />
      {X_SIGN_IN_UI_ENABLED ? (
        <>
          <SignInWithXButton mode={mode} onEmailFallback={onEmailFallback} />
          {showTroubleshoot ? <XOAuthTroubleshoot /> : null}
        </>
      ) : (
        <p className="text-center text-xs text-muted-foreground/80">
          X sign-in coming soon
        </p>
      )}
      <AuthEmailDivider />
    </div>
  );
}