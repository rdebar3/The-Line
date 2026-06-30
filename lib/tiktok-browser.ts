const TIKTOK_UA_PATTERNS = [
  /tiktok/i,
  /musical_ly/i,
  /musical_ly_\d/i,
  /trill_\d/i,
  /bytedancewebview/i,
  /bytedance/i,
  /aweme/i,
  /snssdk/i,
  /appname\/musical_ly/i,
  /com\.zhiliaoapp\.musically/i,
  /jssdk\/2\.0/i,
  /bytelocale\//i,
  /bytefulllocale\//i,
];

const IN_APP_OAUTH_HOSTILE_PATTERNS = [
  ...TIKTOK_UA_PATTERNS,
  /instagram/i,
  /fban|fbav/i,
  /fb_iab/i,
  /line\//i,
  /twitter/i,
  /linkedinapp/i,
  /gsa\//i,
];

const TIKTOK_REFERRER_PATTERNS = /tiktok\.com|tiktokv\.com|musical\.ly/i;

const TIKTOK_URL_PARAM_KEYS = ["tt_medium", "tt_content", "tt_campaign", "tt_from"];

export function isTikTokUserAgent(userAgent: string): boolean {
  return TIKTOK_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function isInAppOAuthHostileUserAgent(userAgent: string): boolean {
  return IN_APP_OAUTH_HOSTILE_PATTERNS.some((pattern) => pattern.test(userAgent));
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

function isIosWebKitInApp(userAgent: string): boolean {
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafariShell =
    /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);

  if (!isIOS || !isSafariShell) return false;

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  const isStandalonePwa = navigatorWithStandalone.standalone === true;

  return !isStandalonePwa;
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

  if (
    isIosWebKitInApp(userAgent) &&
    (isTikTokReferrer(referrer) || hasTikTokUrlSignals(search))
  ) {
    return true;
  }

  const inAppWebView = /webview|bytedance|musical_ly|aweme|jssdk/i.test(userAgent);

  if (inAppWebView && (isTikTokReferrer(referrer) || hasTikTokUrlSignals(search))) {
    return true;
  }

  return false;
}

/**
 * In-app browsers (TikTok and similar) break Google OAuth redirects/cookies.
 */
export function isOAuthHostileInAppBrowser(
  userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
  referrer = typeof document !== "undefined" ? document.referrer : "",
  search = typeof window !== "undefined" ? window.location.search : ""
): boolean {
  if (isTikTokInAppBrowser(userAgent, referrer, search)) return true;
  return isInAppOAuthHostileUserAgent(userAgent);
}

export const TIKTOK_BANNER_DISMISS_KEY = "theline:tiktok-banner-dismissed-v2";

export const TIKTOK_BANNER_OFFSET_VAR = "--tiktok-banner-offset";