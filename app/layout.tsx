import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { PatrioticBackground } from "@/components/background/PatrioticScene";
import { UserScopeSync } from "@/components/auth/user-scope-sync";
import { ClearStaleServiceWorker } from "@/components/dev/clear-stale-service-worker";
import { AuthHeader } from "@/components/layout/auth-header";
import { TikTokBrowserBanner } from "@/components/layout/tiktok-browser-banner";
import { SavedLinesProvider } from "@/components/my-lines/saved-lines-provider";
import { CallsignPrompt } from "@/components/leaderboard/callsign-prompt";
import { LeaderboardSyncProvider } from "@/components/leaderboard/leaderboard-sync-provider";
import { FirstLoginTutorial } from "@/components/onboarding/first-login-tutorial";
import { WelcomeOnboarding } from "@/components/onboarding/welcome-onboarding";
import { UnlockCelebration } from "@/components/monetization/unlock-celebration";
import { ProgressionProvider } from "@/components/progression/progression-provider";
import { SubscriptionProvider } from "@/components/monetization/subscription-provider";
import { getAppUrl } from "@/lib/app-url";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: {
    default: "The Line",
    template: "%s | The Line",
  },
  description:
    "Understand it. Defend it. Hold the line. A civic education platform for the founding documents and the rights they protect.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "The Line",
    description:
      "Train on the founding documents, build your Defender Score, and hold the constitutional line.",
    url: appUrl,
    siteName: "The Line",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Line",
    description:
      "Civic defense training on the Declaration, Constitution, and Bill of Rights.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="relative flex min-h-full min-w-0 flex-col overflow-x-hidden font-sans">
        <PatrioticBackground />
        <ClerkProvider
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <UserScopeSync />
          <ClearStaleServiceWorker />
          <SubscriptionProvider>
            <TikTokBrowserBanner />
            <AuthHeader />
            <ProgressionProvider>
              <LeaderboardSyncProvider>
                <SavedLinesProvider>
                  {children}
                  <WelcomeOnboarding />
                  <FirstLoginTutorial />
                  <CallsignPrompt />
                  <UnlockCelebration />
                </SavedLinesProvider>
              </LeaderboardSyncProvider>
            </ProgressionProvider>
          </SubscriptionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}