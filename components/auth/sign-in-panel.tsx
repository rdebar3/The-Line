"use client";

import { SignIn } from "@clerk/nextjs";

import { ClerkAuthShell } from "@/components/auth/clerk-auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignInPanel() {
  return (
    <ClerkAuthShell>
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </ClerkAuthShell>
  );
}