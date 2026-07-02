"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Lock } from "lucide-react";

import { useSubscription } from "@/hooks/use-subscription";

export function AuthHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPremium, isLoading, openUnlockModal } = useSubscription();
  const showUserMenu = isLoaded && isSignedIn;
  const showUnlockCta = isLoaded && !isLoading && !isPremium;

  return (
    <header className="sticky top-[var(--tiktok-banner-offset,0px)] z-50 border-b border-gold/10 bg-navy/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[3.75rem] sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.6)]"
          />
          <span className="font-heading text-xs font-bold tracking-[0.22em] text-gold uppercase sm:tracking-[0.28em]">
            The Line
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          {showUnlockCta && (
            <button
              type="button"
              onClick={openUnlockModal}
              className="btn-gold premium-button inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gold/35 bg-gradient-to-r from-crimson/90 via-crimson-dark to-gold-dark px-2.5 text-[0.65rem] font-bold tracking-wide text-white shadow-[0_0_16px_rgba(201,162,39,0.2)] transition-all hover:from-crimson hover:via-crimson hover:to-gold sm:h-9 sm:gap-2 sm:px-3.5 sm:text-xs"
            >
              <Lock className="size-3 shrink-0 sm:size-3.5" />
              <span className="hidden min-[380px]:inline">Unlock Full Access</span>
              <span className="min-[380px]:hidden">Unlock</span>
            </button>
          )}

          {showUserMenu ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "size-8 border-2 border-gold/30 shadow-[0_0_12px_rgba(201,162,39,0.2)]",
                },
              }}
            />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="auth-btn-signin inline-flex h-8 items-center justify-center rounded-lg border border-navy-border/80 bg-navy-elevated/50 px-2.5 text-[0.7rem] font-semibold tracking-wide text-foreground transition-all hover:border-gold/30 hover:bg-navy-elevated sm:h-9 sm:px-4 sm:text-xs"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="auth-btn-signup btn-gold premium-button inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-[0.7rem] font-semibold tracking-wide shadow-[0_0_20px_rgba(201,162,39,0.15)] sm:h-9 sm:px-4 sm:text-xs"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}