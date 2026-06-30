"use client";

import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  SignIn,
} from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignInPanel() {
  return (
    <>
      <ClerkLoading>
        <p className="text-sm text-muted-foreground">Loading sign in…</p>
      </ClerkLoading>
      <ClerkFailed>
        <p className="max-w-sm text-center text-sm text-crimson">
          Sign-in could not load. Refresh the page or try again in a moment.
        </p>
      </ClerkFailed>
      <ClerkLoaded>
        <SignIn
          routing="path"
          path="/sign-in"
          appearance={clerkAppearance}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </ClerkLoaded>
    </>
  );
}