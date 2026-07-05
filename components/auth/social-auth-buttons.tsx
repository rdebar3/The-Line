"use client";

import { SignInWithGoogleButton } from "@/components/auth/sign-in-with-google-button";
import { AuthEmailDivider } from "@/components/auth/auth-email-divider";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";

type SocialAuthButtonsProps = {
  mode: "sign-in" | "sign-up";
  onEmailFallback?: () => void;
};

export function SocialAuthButtons({
  mode,
}: SocialAuthButtonsProps) {
  const { isOAuthHostile, ready } = useInAppBrowser();

  if (ready && isOAuthHostile) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SignInWithGoogleButton mode={mode} />
      <AuthEmailDivider />
    </div>
  );
}