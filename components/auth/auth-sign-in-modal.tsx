"use client";

import { useEffect, useMemo, useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Mail } from "lucide-react";

import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import { cn } from "@/lib/utils";

type AuthView = "welcome" | "email-sign-in" | "email-sign-up";

type AuthSignInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthSignInModal({ open, onOpenChange }: AuthSignInModalProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [view, setView] = useState<AuthView>("welcome");
  const appearance = useMemo(() => getClerkAppearance(), []);

  useEffect(() => {
    if (isLoaded && isSignedIn && open) {
      onOpenChange(false);
    }
  }, [isLoaded, isSignedIn, open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setView("welcome");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="premium-card max-w-md border-gold/20 bg-navy-elevated/95 p-0 shadow-[0_0_80px_rgba(201,162,39,0.12)] backdrop-blur-md sm:max-w-md"
      >
        <div className="relative overflow-hidden rounded-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.1)_0%,transparent_60%)]"
          />

          <div className="relative space-y-5 p-6 sm:p-7">
            {view !== "welcome" && (
              <button
                type="button"
                onClick={() => setView("welcome")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
            )}

            <DialogHeader
              className={cn(
                "text-center",
                view !== "welcome" && "items-center"
              )}
            >
              <DialogTitle className="font-heading text-xl font-bold tracking-wide text-foreground sm:text-2xl">
                {view === "email-sign-up" ? "Create your account" : "Welcome back"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {view === "welcome"
                  ? "Sign in to save progress, join the leaderboard, and unlock your constitutional training."
                  : view === "email-sign-in"
                    ? "Use your email to sign in securely."
                    : "Create a free account to track your training journey."}
              </DialogDescription>
            </DialogHeader>

            {view === "welcome" && (
              <div className="space-y-4">
                <SocialAuthButtons
                  mode="sign-in"
                  onEmailFallback={() => setView("email-sign-in")}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("email-sign-in")}
                  className="h-11 w-full gap-2 border-navy-border/80 bg-navy/40 text-sm font-semibold hover:border-gold/30 hover:bg-navy-elevated"
                >
                  <Mail className="size-4" />
                  Continue with Email
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  New to The Line?{" "}
                  <button
                    type="button"
                    onClick={() => setView("email-sign-up")}
                    className="font-semibold text-gold underline-offset-2 transition-colors hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {view === "email-sign-in" && (
              <div className="max-h-[min(52dvh,28rem)] overflow-y-auto pr-1">
                <SignIn
                  routing="hash"
                  appearance={appearance}
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  New to The Line?{" "}
                  <button
                    type="button"
                    onClick={() => setView("email-sign-up")}
                    className="font-semibold text-gold underline-offset-2 transition-colors hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {view === "email-sign-up" && (
              <div className="max-h-[min(52dvh,28rem)] overflow-y-auto pr-1">
                <SocialAuthButtons mode="sign-up" />
                <SignUp
                  routing="hash"
                  appearance={appearance}
                  signInUrl="/sign-in"
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setView("email-sign-in")}
                    className="font-semibold text-gold underline-offset-2 transition-colors hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}