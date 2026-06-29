import { SignIn } from "@clerk/nextjs";

import { PageBackground } from "@/components/rights/page-background";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <PageBackground>
      <div className="page-shell flex min-h-[calc(100dvh-var(--site-header-height))] max-w-6xl items-center justify-center px-4 py-8 sm:py-12">
        <SignIn
          appearance={clerkAppearance}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </PageBackground>
  );
}