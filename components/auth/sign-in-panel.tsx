"use client";

import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignInPanel() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      appearance={clerkAppearance}
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
    />
  );
}