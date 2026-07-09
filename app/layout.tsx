import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";

import { AppBackground } from "@/components/background/app-background";
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
import { DefenderBadgeProvider } from "@/components/badges/defender-badge-provider";
import { ProgressionProvider } from "@/components/progression/progression-provider";
import { SubscriptionProvider } from "@/components/monetization/subscription-provider";
import { getAppUrl } from "@/lib/app-url";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
      className={`dark min-h-full antialiased ${playfair.variable} ${inter.variable}`}
    >
      <body className="relative flex min-h-full min-w-0 flex-col overflow-x-clip bg-navy font-sans text-foreground">
        <AppBackground />
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
            <ProgressionProvider>
              <TikTokBrowserBanner />
              <AuthHeader />
              <DefenderBadgeProvider>
                <LeaderboardSyncProvider>
                  <SavedLinesProvider>
                    {children}
                    <WelcomeOnboarding />
                    <FirstLoginTutorial />
                    <CallsignPrompt />
                    <UnlockCelebration />
                  </SavedLinesProvider>
                </LeaderboardSyncProvider>
              </DefenderBadgeProvider>
            </ProgressionProvider>
          </SubscriptionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
