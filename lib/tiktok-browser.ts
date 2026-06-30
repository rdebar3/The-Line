const TIKTOK_UA_PATTERNS = [
  /tiktok/i,
  /musical_ly/i,
  /bytedancewebview/i,
  /bytedance/i,
  /aweme/i,
  /trill_/i,
  /snssdk/i,
  /appname\/musical_ly/i,
  /com\.zhiliaoapp\.musically/i,
];

const TIKTOK_REFERRER_PATTERNS = /tiktok\.com|tiktokv\.com|musical\.ly/i;

const TIKTOK_URL_PARAM_KEYS = ["tt_medium", "tt_content", "tt_campaign"];

export function isTikTokUserAgent(userAgent: string): boolean {
  return TIKTOK_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function isTikTokReferrer(referrer: string): boolean {
  return TIKTOK_REFERRER_PATTERNS.test(referrer);
}

export function hasTikTokUrlSignals(search: string): boolean {
  if (!search) return false;

  const params = new URLSearchParams(search);
  const utmSource = params.get("utm_source")?.toLowerCase() ?? "";

  if (utmSource.includes("tiktok")) return true;

  return TIKTOK_URL_PARAM_KEYS.some((key) => params.has(key));
}

export function hasTikTokBridge(): boolean {
  if (typeof window === "undefined") return false;

  const bridgeWindow = window as Window & {
    TiktokJSBridge?: unknown;
    __tiktok_inapp?: unknown;
    tt?: { miniProgram?: unknown };
  };

  return Boolean(
    bridgeWindow.TiktokJSBridge ||
      bridgeWindow.__tiktok_inapp ||
      bridgeWindow.tt?.miniProgram
  );
}

/**
 * Detects TikTok's in-app browser (not a normal browser opened from a TikTok link).
 */
export function isTikTokInAppBrowser(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
  referrer = typeof document !== "undefined" ? document.referrer : "",
  search = typeof window !== "undefined" ? window.location.search : ""
): boolean {
  if (!userAgent && typeof window === "undefined") return false;

  if (isTikTokUserAgent(userAgent)) return true;
  if (hasTikTokBridge()) return true;

  const inAppWebView = /webview|bytedance|musical_ly|aweme/i.test(userAgent);

  if (inAppWebView && (isTikTokReferrer(referrer) || hasTikTokUrlSignals(search))) {
    return true;
  }

  return false;
}

export const TIKTOK_BANNER_DISMISS_KEY = "theline:tiktok-banner-dismissed";

export const TIKTOK_BANNER_OFFSET_VAR = "--tiktok-banner-offset";