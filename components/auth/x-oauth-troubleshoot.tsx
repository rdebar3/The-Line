"use client";

import {
  CLERK_X_CALLBACK_URL,
  CLERK_X_CLIENT_ID,
} from "@/lib/clerk-x-oauth";

export function XOAuthTroubleshoot() {
  return (
    <details className="rounded-lg border border-navy-border/50 bg-navy/20 px-3 py-2 text-left">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
        X sign-in shows an error?
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          The app code is working — this error comes from X&apos;s app settings.
          In the{" "}
          <a
            href="https://developer.x.com/en/portal/dashboard"
            className="text-gold underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            X Developer Portal
          </a>
          , open your app → <strong>User authentication settings</strong> and
          verify:
        </p>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>
            <strong>Callback URI</strong> is exactly:{" "}
            <code className="break-all text-foreground">{CLERK_X_CALLBACK_URL}</code>
          </li>
          <li>
            <strong>Client ID</strong> matches Clerk:{" "}
            <code className="break-all text-foreground">{CLERK_X_CLIENT_ID}</code>
          </li>
          <li>
            <strong>Request email from users</strong> is enabled (Clerk needs an
            email to create your account).
          </li>
          <li>
            <strong>App permissions</strong> includes at least <strong>Read</strong>.
          </li>
          <li>
            If the app is not in Production mode, add your X account under{" "}
            <strong>Test users</strong>.
          </li>
        </ol>
        <p>
          After saving in X, copy the Client ID and Client Secret into{" "}
          <strong>Clerk Dashboard → SSO connections → X</strong>, then try again.
        </p>
      </div>
    </details>
  );
}