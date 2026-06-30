export type OpenExternalBrowserResult = "safari" | "chrome" | "copy";

export async function copyUrlToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(input);
      return copied;
    } catch {
      return false;
    }
  }
}

/**
 * Best-effort attempt to jump from an in-app browser into the system browser.
 * Always falls back to copying the URL for manual paste.
 */
export async function openInExternalBrowser(
  url: string
): Promise<OpenExternalBrowserResult> {
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (isIOS) {
    const safariUrl = url.startsWith("http") ? `x-safari-${url}` : `x-safari-https://${url}`;
    window.location.assign(safariUrl);
    await copyUrlToClipboard(url);
    return "safari";
  }

  if (isAndroid) {
    const stripped = url.replace(/^https?:\/\//, "");
    const intent = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.assign(intent);
    await copyUrlToClipboard(url);
    return "chrome";
  }

  await copyUrlToClipboard(url);
  return "copy";
}