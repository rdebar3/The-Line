"use client";

import { useEffect, useState } from "react";

import { isTikTokInAppBrowser } from "@/lib/tiktok-browser";

export function useTikTokInAppBrowser() {
  const [isTikTokBrowser, setIsTikTokBrowser] = useState(false);

  useEffect(() => {
    setIsTikTokBrowser(isTikTokInAppBrowser());
  }, []);

  return isTikTokBrowser;
}