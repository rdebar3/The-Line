"use client";

import { useMemo, useState } from "react";
import { SignIn } from "@clerk/nextjs";

import { ClerkAuthShell } from "@/components/auth/clerk-auth-shell";
import { InAppBrowserAuthGate } from "@/components/auth/in-app-browser-auth-gate";
import {
  AuthEmailDivider,
  SignInWithXButton,
} from "@/components/auth/sign-in-with-x-button";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export function SignInPanel() {
  const { isOAuthHostile, ready } = useInAppBrowser();
  const [bypassGate, setBypassGate] = useState(false);

  const appearance = useMemo(() => getClerkAppearance(), []);

  const showGate = ready && isOAuthHostile && !bypassGate;

  if (showGate) {
    return (
      <InAppBrowserAuthGate
        mode="sign-in"
        onContinueInApp={() => setBypassGate(true)}
      />
    );
  }

  return (
    <ClerkAuthShell>
      <div className="space-y-4">
        <SignInWithXButton mode="sign-in" />
        <AuthEmailDivider />
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={appearance}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </ClerkAuthShell>
  );
}