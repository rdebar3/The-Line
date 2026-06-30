import { SignInPanel } from "@/components/auth/sign-in-panel";
import { PageBackground } from "@/components/rights/page-background";

export default function SignInPage() {
  return (
    <PageBackground>
      <div className="page-shell flex min-h-[calc(100dvh-var(--site-header-height))] max-w-6xl items-center justify-center px-4 py-8 sm:py-12">
        <SignInPanel />
      </div>
    </PageBackground>
  );
}