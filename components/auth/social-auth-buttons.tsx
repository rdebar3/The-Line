"use client";

import {
  AuthEmailDivider,
  SignInWithXButton,
} from "@/components/auth/sign-in-with-x-button";
import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";
import { XOAuthTroubleshoot } from "@/components/auth/x-oauth-troubleshoot";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";

type SocialAuthButtonsProps = {
  mode: "sign-in" | "sign-up";
  showTroubleshoot?: boolean;
};

export function SocialAuthButtons({
  mode,
  showTroubleshoot = mode === "sign-in",
}: SocialAuthButtonsProps) {
  const { isOAuthHostile, ready } = useInAppBrowser();

  if (ready && isOAuthHostile) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SignInWithGoogleButton mode={mode} />
      <SignInWithXButton mode={mode} />
      {showTroubleshoot ? <XOAuthTroubleshoot /> : null}
      <AuthEmailDivider />
    </div>
  );
}