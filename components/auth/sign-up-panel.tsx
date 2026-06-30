"use client";

import { SignUp } from "@clerk/nextjs";

import { ClerkAuthShell } from "@/components/auth/clerk-auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  return (
    <ClerkAuthShell>
      <SignUp
        routing="path"
        path="/sign-up"
        appearance={clerkAppearance}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </ClerkAuthShell>
  );
}