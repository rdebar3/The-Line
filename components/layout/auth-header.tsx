"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { animate } from "motion/react";
import { Lock, Sparkles } from "lucide-react";

import { AuthSignInModal } from "@/components/auth/auth-sign-in-modal";
import { MobileSiteNav, SiteNav } from "@/components/layout/site-nav";
import { useProgression } from "@/hooks/use-progression";
import { useSubscription } from "@/hooks/use-subscription";

function DefenderScoreBadge() {
  const { isLoaded, defenderScore } = useProgression();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    const controls = animate(display, defenderScore, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defenderScore, isLoaded]);

  return (
    <span className="museum-score-badge" title="Defender Score">
      <span className="hidden sm:inline">Score</span>
      <strong>{isLoaded ? display.toLocaleString() : "—"}</strong>
    </span>
  );
}

export function AuthHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium, isLoading, openUnlockModal } = useSubscription();
  const [signInOpen, setSignInOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showUserMenu = isLoaded && isSignedIn;
  const showUnlockCta = isLoaded && !isLoading && !isPremium;
  const showPremiumBadge = isLoaded && !isLoading && isPremium && isSignedIn;
  const showSignIn = isLoaded && !isSignedIn;

  return (
    <header className="museum-header command-header-bar">
      <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:gap-5 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden
            className="hidden size-1.5 rounded-full bg-[#C5A46E] shadow-[0_0_12px_rgba(197,164,110,0.55)] sm:block"
          />
          <span className="font-heading text-[1.05rem] font-semibold tracking-[0.06em] text-[#F5F1E9] sm:text-lg">
            The Line
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center px-1 md:px-3">
          <SiteNav
            mobileOpen={mobileNavOpen}
            onMobileOpenChange={setMobileNavOpen}
          />
        </div>

        <nav
          aria-label="Account"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2.5"
        >
          <DefenderScoreBadge />

          {showPremiumBadge && (
            <span className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full border border-[rgba(197,164,110,0.28)] bg-[rgba(197,164,110,0.08)] px-3 text-[0.65rem] font-semibold tracking-wide text-[#C5A46E] sm:inline-flex">
              <Sparkles className="size-3.5 shrink-0" />
              Full Access
            </span>
          )}

          {showUnlockCta && (
            <button
              type="button"
              onClick={openUnlockModal}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[rgba(197,164,110,0.28)] bg-transparent px-3 text-[0.7rem] font-semibold tracking-wide text-[#C5A46E] transition-colors hover:border-[rgba(197,164,110,0.5)] hover:bg-[rgba(197,164,110,0.08)] sm:px-3.5"
            >
              <Lock className="size-3.5 shrink-0" />
              <span className="hidden min-[420px]:inline">Unlock</span>
            </button>
          )}

          {showSignIn && (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[rgba(197,164,110,0.18)] bg-[rgba(15,29,51,0.55)] px-3.5 text-[0.75rem] font-medium tracking-wide text-[#F5F1E9] transition-all hover:border-[rgba(197,164,110,0.35)] hover:bg-[rgba(15,29,51,0.85)] sm:px-4"
            >
              Sign In
            </button>
          )}

          {showUserMenu && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "size-8 border border-[rgba(197,164,110,0.35)] shadow-[0_0_12px_rgba(197,164,110,0.15)]",
                },
              }}
            />
          )}
        </nav>
      </div>

      <MobileSiteNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <AuthSignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}
