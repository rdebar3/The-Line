"use client";

import { SignUp } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
    />
  );
}