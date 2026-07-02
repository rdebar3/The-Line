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
          This message is shown by <strong>X</strong> before our app receives
          anything — the redirect and Clerk connection are working. Fix it in the{" "}
          <a
            href="https://developer.x.com/en/portal/dashboard"
            className="text-gold underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            X Developer Portal
          </a>{" "}
          and your X account settings.
        </p>
        <ol className="list-decimal space-y-1.5 pl-4">
          <li>
            <strong>Callback URI</strong> must be exactly (not your app URL):{" "}
            <code className="break-all text-foreground">{CLERK_X_CALLBACK_URL}</code>
          </li>
          <li>
            <strong>Type of App</strong> = Web App, Automated App or Bot.
          </li>
          <li>
            <strong>Website URL</strong> is filled in (e.g.{" "}
            <code className="text-foreground">https://the-line-eight.vercel.app</code>
            ).
          </li>
          <li>
            <strong>Client ID</strong> matches Clerk:{" "}
            <code className="break-all text-foreground">{CLERK_X_CLIENT_ID}</code>
          </li>
          <li>
            <strong>Request email from users</strong> is enabled (required — Clerk
            needs an email to sign you up).
          </li>
          <li>
            <strong>App permissions</strong> includes at least <strong>Read</strong>.
          </li>
          <li>
            If the app is not in Production mode, add your X handle under{" "}
            <strong>Test users</strong>.
          </li>
          <li>
            On X: <strong>Settings → Security and account access → Apps and
            sessions</strong> — make sure third-party app access isn&apos;t
            blocked for your account.
          </li>
        </ol>
        <p>
          After any save in X, re-copy the <strong>Client Secret</strong> (it
          often regenerates when the callback changes) into{" "}
          <strong>Clerk Dashboard → SSO connections → X</strong>, then try again
          in a normal browser (not an in-app browser).
        </p>
      </div>
    </details>
  );
}