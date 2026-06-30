"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { openInExternalBrowser } from "@/lib/open-external-browser";
import {
  TIKTOK_BANNER_DISMISS_KEY,
  TIKTOK_BANNER_OFFSET_VAR,
} from "@/lib/tiktok-browser";

export function TikTokBrowserBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { isTikTokBrowser, ready } = useInAppBrowser();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const syncBannerOffset = useCallback((height: number) => {
    document.documentElement.style.setProperty(
      TIKTOK_BANNER_OFFSET_VAR,
      height > 0 ? `${height}px` : "0px"
    );
  }, []);

  useEffect(() => {
    if (!ready) return;

    const dismissed = sessionStorage.getItem(TIKTOK_BANNER_DISMISS_KEY) === "1";
    const onAuthRoute = /^\/(sign-in|sign-up)(\/|$)/.test(window.location.pathname);

    setVisible(isTikTokBrowser && !dismissed && !onAuthRoute);
  }, [isTikTokBrowser, ready]);

  useEffect(() => {
    if (!visible) {
      syncBannerOffset(0);
      return;
    }

    const updateOffset = () => {
      syncBannerOffset(bannerRef.current?.offsetHeight ?? 0);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      syncBannerOffset(0);
    };
  }, [visible, syncBannerOffset]);

  const dismiss = () => {
    sessionStorage.setItem(TIKTOK_BANNER_DISMISS_KEY, "1");
    setVisible(false);
    syncBannerOffset(0);
  };

  const openExternal = async () => {
    const result = await openInExternalBrowser(window.location.href);

    if (result === "safari" || result === "chrome") {
      setStatus("If Safari/Chrome didn't open, tap ⋯ in TikTok → Open in browser.");
    } else {
      setStatus("Link copied. Paste into Chrome or Safari.");
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[70] border-b border-gold/25 bg-[linear-gradient(180deg,#0a0f1c_0%,#121a2e_100%)] shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
    >
      <div
        aria-hidden
        className="h-0.5 bg-gradient-to-r from-crimson/80 via-gold to-crimson/80"
      />

      <div className="mx-auto flex w-full min-w-0 max-w-6xl items-start gap-3 px-3 py-3 sm:items-center sm:gap-4 sm:px-6 sm:py-3.5">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 sm:mt-0">
          <ExternalLink className="size-4 text-gold" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-foreground sm:text-[0.95rem]">
            You&apos;re in TikTok&apos;s browser — Google sign-in will fail here.
            Open in Safari or Chrome instead.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {status ??
              "Tap below, then use TikTok's ⋯ menu → Open in browser for the best experience."}
          </p>

          <Button
            type="button"
            onClick={openExternal}
            className="btn-gold premium-button mt-2.5 h-9 w-full rounded-lg px-4 text-xs font-semibold tracking-wide sm:mt-3 sm:w-auto sm:text-sm"
          >
            Open in Safari / Chrome
          </Button>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss TikTok browser notice"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-navy-border/80 text-muted-foreground transition-colors hover:border-crimson/40 hover:bg-crimson/10 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}