"use client";

import { useEffect, useState } from "react";

import {
  isOAuthHostileInAppBrowser,
  isTikTokInAppBrowser,
} from "@/lib/tiktok-browser";

export function useInAppBrowser() {
  const [state, setState] = useState({
    isTikTokBrowser: false,
    isOAuthHostile: false,
    ready: false,
  });

  useEffect(() => {
    setState({
      isTikTokBrowser: isTikTokInAppBrowser(),
      isOAuthHostile: isOAuthHostileInAppBrowser(),
      ready: true,
    });
  }, []);

  return state;
}