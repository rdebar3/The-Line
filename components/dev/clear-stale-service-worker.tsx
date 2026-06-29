"use client";

import { useEffect } from "react";

export function ClearStaleServiceWorker() {
  useEffect(() => {
    async function cleanup() {
      if (!("serviceWorker" in navigator)) return;

      const alreadyCleared = sessionStorage.getItem("theline-sw-cleared");

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        let shouldReload = registrations.length > 0;

        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );

        if ("caches" in window) {
          const keys = await caches.keys();
          if (keys.length > 0) {
            shouldReload = true;
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
        }

        if (shouldReload && !alreadyCleared) {
          sessionStorage.setItem("theline-sw-cleared", "1");
          window.location.reload();
        }
      } catch {
        // Non-fatal cleanup
      }
    }

    void cleanup();
  }, []);

  return null;
}