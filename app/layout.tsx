import type { Metadata } from "next";
import {
  Cinzel,
  Geist_Mono,
  Libre_Baskerville,
  Source_Sans_3,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { UserScopeSync } from "@/components/auth/user-scope-sync";
import { ClearStaleServiceWorker } from "@/components/dev/clear-stale-service-worker";
import { AuthHeader } from "@/components/layout/auth-header";
import { FirstLoginTutorial } from "@/components/onboarding/first-login-tutorial";
import { UnlockCelebration } from "@/components/monetization/unlock-celebration";
import { ProgressionProvider } from "@/components/progression/progression-provider";
import { SubscriptionProvider } from "@/components/monetization/subscription-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://theline.app";

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
      className={`${cinzel.variable} ${sourceSans.variable} ${geistMono.variable} ${libreBaskerville.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-hidden">
        <ClerkProvider
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <UserScopeSync />
          <ClearStaleServiceWorker />
          <AuthHeader />
          <SubscriptionProvider>
            <ProgressionProvider>
              {children}
              <FirstLoginTutorial />
              <UnlockCelebration />
            </ProgressionProvider>
          </SubscriptionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}