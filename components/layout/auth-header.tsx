"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Lock, Sparkles } from "lucide-react";

import { AuthSignInModal } from "@/components/auth/auth-sign-in-modal";
import { MobileSiteNav, SiteNav } from "@/components/layout/site-nav";
import { useSubscription } from "@/hooks/use-subscription";

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
    <header className="command-header-bar">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
      <div className="relative mx-auto flex h-14 w-full min-w-0 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[3.75rem] sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span aria-hidden className="command-status-dot" />
          <span className="font-heading text-xs font-bold tracking-[0.22em] text-gold uppercase sm:tracking-[0.28em]">
            The Line
          </span>
          <span className="hidden font-mono text-[0.6rem] font-medium tracking-widest text-muted-foreground/80 sm:inline">
            CMD
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center px-1 md:px-4">
          <SiteNav
            mobileOpen={mobileNavOpen}
            onMobileOpenChange={setMobileNavOpen}
          />
        </div>

        <nav
          aria-label="Account"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          {showPremiumBadge && (
            <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-2.5 text-[0.65rem] font-bold tracking-wide text-gold sm:h-9 sm:px-3 sm:text-xs">
              <Sparkles className="size-3 shrink-0 sm:size-3.5" />
              <span className="hidden min-[420px]:inline">Full Access</span>
              <span className="min-[420px]:hidden">Pro</span>
            </span>
          )}

          {showUnlockCta && (
            <button
              type="button"
              onClick={openUnlockModal}
              className="btn-gold premium-button inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gold/35 bg-gradient-to-r from-crimson/90 via-crimson-dark to-gold-dark px-2.5 text-[0.65rem] font-bold tracking-wide text-white shadow-[0_0_16px_rgba(201,162,39,0.2)] transition-all hover:from-crimson hover:via-crimson hover:to-gold sm:h-9 sm:gap-2 sm:px-3.5 sm:text-xs"
            >
              <Lock className="size-3 shrink-0 sm:size-3.5" />
              <span className="hidden min-[420px]:inline">Unlock</span>
            </button>
          )}

          {showSignIn && (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="auth-btn-signin inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-navy-border/80 bg-navy-elevated/50 px-3 text-[0.7rem] font-semibold tracking-wide text-foreground transition-all hover:border-gold/30 hover:bg-navy-elevated sm:h-9 sm:px-4 sm:text-xs"
            >
              Sign In
            </button>
          )}

          {showUserMenu && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "size-8 border-2 border-gold/30 shadow-[0_0_12px_rgba(201,162,39,0.2)]",
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