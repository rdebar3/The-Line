"use client";

import { useState } from "react";
import { ExternalLink, Globe, Mail, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { openInExternalBrowser } from "@/lib/open-external-browser";

type InAppBrowserAuthGateProps = {
  mode: "sign-in" | "sign-up";
  onContinueInApp: () => void;
};

export function InAppBrowserAuthGate({
  mode,
  onContinueInApp,
}: InAppBrowserAuthGateProps) {
  const { isTikTokBrowser, isOAuthHostile, ready } = useInAppBrowser();
  const [opening, setOpening] = useState(false);
  const [openResult, setOpenResult] = useState<string | null>(null);

  if (!ready || !isOAuthHostile) return null;

  const actionLabel = mode === "sign-in" ? "sign in" : "create your account";

  const handleOpenExternal = async () => {
    setOpening(true);
    const result = await openInExternalBrowser(window.location.href);

    if (result === "safari") {
      setOpenResult(
        "Opening Safari… If nothing happens, tap ⋯ in TikTok → Open in browser."
      );
    } else if (result === "chrome") {
      setOpenResult(
        "Opening Chrome… If nothing happens, tap ⋯ in TikTok → Open in browser."
      );
    } else {
      setOpenResult("Link copied. Paste it into Chrome or Safari to continue.");
    }

    setOpening(false);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-gold/30 bg-[linear-gradient(180deg,#0a0f1c_0%,#121a2e_100%)] p-5 shadow-[0_0_50px_rgba(201,162,39,0.12)] sm:p-6">
      <div
        aria-hidden
        className="mb-4 h-0.5 bg-gradient-to-r from-crimson/80 via-gold to-crimson/80"
      />

      <div className="mb-3 flex items-center gap-2 text-gold">
        <Smartphone className="size-5 shrink-0" />
        <p className="font-heading text-xs font-semibold tracking-[0.28em] uppercase">
          {isTikTokBrowser ? "TikTok Browser Detected" : "In-App Browser Detected"}
        </p>
      </div>

      <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
        Google sign-in won&apos;t work here
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {isTikTokBrowser
          ? "TikTok's built-in browser blocks Google login. Open The Line in Safari or Chrome to "
          : "This in-app browser blocks Google login. Open The Line in your phone's browser to "}
        {actionLabel} smoothly.
      </p>

      <ol className="mt-4 space-y-2 rounded-lg border border-navy-border/70 bg-navy/50 p-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        <li>1. Tap the button below (or copy the link).</li>
        <li>2. In TikTok, tap <strong className="text-foreground">⋯</strong> (top right).</li>
        <li>3. Choose <strong className="text-foreground">Open in browser</strong> or <strong className="text-foreground">Open in Safari</strong>.</li>
        <li>4. Sign in with Google or email in Chrome/Safari.</li>
      </ol>

      {openResult && (
        <p className="mt-3 rounded-lg border border-gold/25 bg-gold/10 px-3 py-2 text-xs leading-relaxed text-foreground sm:text-sm">
          {openResult}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        <Button
          type="button"
          disabled={opening}
          onClick={handleOpenExternal}
          className="btn-gold premium-button h-11 w-full rounded-xl text-sm font-semibold"
        >
          <ExternalLink className="size-4" />
          {opening ? "Opening browser…" : "Open in Safari / Chrome"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onContinueInApp}
          className="h-11 w-full rounded-xl border-gold/25 bg-navy/40 text-sm text-foreground hover:border-gold/40 hover:bg-gold/10"
        >
          <Mail className="size-4 text-gold" />
          Continue with email only (in TikTok)
        </Button>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[0.7rem] leading-relaxed text-muted-foreground sm:text-xs">
        <Globe className="mt-0.5 size-3.5 shrink-0 text-gold" />
        Email sign-in may still work here, but Google sign-in is disabled in TikTok&apos;s browser.
      </p>
    </div>
  );
}