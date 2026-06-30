"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export function AuthHeader() {
  const { isSignedIn, isLoaded } = useAuth();
  const showUserMenu = isLoaded && isSignedIn;

  return (
    <header className="sticky top-[var(--tiktok-banner-offset,0px)] z-50 border-b border-gold/10 bg-navy/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[3.75rem] sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.6)]"
          />
          <span className="font-heading text-xs font-bold tracking-[0.28em] text-gold uppercase sm:text-sm">
            The Line
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-2.5">
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
                className="auth-btn-signin inline-flex h-9 items-center justify-center rounded-lg border border-navy-border/80 bg-navy-elevated/50 px-3 text-xs font-semibold tracking-wide text-foreground transition-all hover:border-gold/30 hover:bg-navy-elevated sm:px-4"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="auth-btn-signup btn-gold premium-button inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(201,162,39,0.15)] sm:px-4"
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