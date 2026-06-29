import { SignUp } from "@clerk/nextjs";

import { PageBackground } from "@/components/rights/page-background";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <PageBackground>
      <div className="page-shell flex min-h-[calc(100dvh-var(--site-header-height))] max-w-6xl items-center justify-center px-4 py-8 sm:py-12">
        <SignUp
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>
    </PageBackground>
  );
}