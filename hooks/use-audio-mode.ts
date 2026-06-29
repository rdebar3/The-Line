"use client";

import { useCallback, useEffect, useState } from "react";

const AUDIO_PREF_KEY = "theline_audio_mode";

export function useAudioMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEnabled(localStorage.getItem(AUDIO_PREF_KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((previous) => {
      const next = !previous;
      localStorage.setItem(AUDIO_PREF_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { enabled, toggle, speak, stop };
}