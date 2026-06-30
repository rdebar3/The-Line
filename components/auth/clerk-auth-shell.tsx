"use client";

import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

export function ClerkAuthShell({ children }: { children: ReactNode }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="w-full max-w-md rounded-xl border border-gold/25 bg-navy-elevated/90 px-6 py-10 text-center shadow-[0_0_40px_rgba(201,162,39,0.08)]">
        <p className="text-sm text-muted-foreground">Loading secure sign-in…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-gold/25 bg-navy-elevated/90 p-4 shadow-[0_0_40px_rgba(201,162,39,0.08)] sm:p-6">
      {children}
    </div>
  );
}