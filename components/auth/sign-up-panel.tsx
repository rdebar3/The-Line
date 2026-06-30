"use client";

import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  SignUp,
} from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  return (
    <>
      <ClerkLoading>
        <p className="text-sm text-muted-foreground">Loading sign up…</p>
      </ClerkLoading>
      <ClerkFailed>
        <p className="max-w-sm text-center text-sm text-crimson">
          Sign-up could not load. Refresh the page or try again in a moment.
        </p>
      </ClerkFailed>
      <ClerkLoaded>
        <SignUp
          routing="path"
          path="/sign-up"
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </ClerkLoaded>
    </>
  );
}