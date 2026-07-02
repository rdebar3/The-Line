"use client";

import { useMemo, useState } from "react";
import { SignUp } from "@clerk/nextjs";

import { ClerkAuthShell } from "@/components/auth/clerk-auth-shell";
import { InAppBrowserAuthGate } from "@/components/auth/in-app-browser-auth-gate";
import {
  AuthEmailDivider,
  SignInWithXButton,
} from "@/components/auth/sign-in-with-x-button";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  const { isOAuthHostile, ready } = useInAppBrowser();
  const [bypassGate, setBypassGate] = useState(false);

  const appearance = useMemo(() => getClerkAppearance(), []);

  const showGate = ready && isOAuthHostile && !bypassGate;

  if (showGate) {
    return (
      <InAppBrowserAuthGate
        mode="sign-up"
        onContinueInApp={() => setBypassGate(true)}
      />
    );
  }

  return (
    <ClerkAuthShell>
      <div className="space-y-4">
        <SignInWithXButton mode="sign-up" />
        <AuthEmailDivider />
        <SignUp
          routing="path"
          path="/sign-up"
          appearance={appearance}
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          forceRedirectUrl="/"
        />
      </div>
    </ClerkAuthShell>
  );
}