"use client";

import { useEffect, useState } from "react";

import { getOAuthDebugSnapshot } from "@/lib/clerk-oauth-debug";
import { CLERK_X_CALLBACK_URL } from "@/lib/clerk-x-oauth";

export function OAuthDebugBanner() {
  const [snapshot, setSnapshot] = useState(() =>
    getOAuthDebugSnapshot(
      typeof window !== "undefined" ? window.location.origin : null
    )
  );

  useEffect(() => {
    setSnapshot(getOAuthDebugSnapshot(window.location.origin));
  }, []);

  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-left text-[0.65rem] leading-relaxed text-amber-100/90 sm:text-xs"
    >
      <p className="mb-1.5 font-semibold tracking-wide text-amber-200 uppercase">
        OAuth debug (temporary)
      </p>
      <dl className="grid gap-1 sm:grid-cols-2">
        <div>
          <dt className="text-amber-200/70">Environment</dt>
          <dd className="font-mono text-foreground">{snapshot.environment}</dd>
        </div>
        <div>
          <dt className="text-amber-200/70">Clerk key</dt>
          <dd className="font-mono text-foreground">
            {snapshot.publishableKeyMode}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-amber-200/70">Clerk X callback (X portal)</dt>
          <dd className="break-all font-mono text-foreground">
            {CLERK_X_CALLBACK_URL}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-amber-200/70">App SSO callback (sign-in)</dt>
          <dd className="break-all font-mono text-foreground">
            {snapshot.signInSsoCallback}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-amber-200/70">Origin</dt>
          <dd className="break-all font-mono text-foreground">
            {snapshot.origin ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}