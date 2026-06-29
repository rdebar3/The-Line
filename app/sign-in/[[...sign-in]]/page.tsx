import { SignIn } from "@clerk/nextjs";

import { PageBackground } from "@/components/rights/page-background";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <PageBackground>
      <div className="page-shell flex min-h-[calc(100vh-3.5rem)] max-w-6xl items-center justify-center py-12">
        <SignIn appearance={clerkAppearance} />
      </div>
    </PageBackground>
  );
}