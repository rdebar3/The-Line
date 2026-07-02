"use client";

import {
  CLERK_SSO_CONNECTIONS_URL,
  CLERK_X_CALLBACK_URL,
  CLERK_X_CLIENT_ID,
  X_OAUTH_RECOMMENDED_SCOPES,
} from "@/lib/clerk-x-oauth";

export function XOAuthTroubleshoot() {
  return (
    <details className="rounded-lg border border-navy-border/50 bg-navy/20 px-3 py-2 text-left">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
        X sign-in asks for email or shows an error?
      </summary>
      <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <div className="space-y-1.5 rounded-md border border-gold/20 bg-gold/5 px-2.5 py-2">
          <p className="font-semibold text-foreground">
            &quot;Fill in missing fields&quot; after X approval
          </p>
          <p>
            X approved the login, but Clerk did not receive an email. Fix both
            sides below, then revoke The Line under{" "}
            <strong>X → Settings → Security → Apps and sessions</strong> and
            sign in with X again.
          </p>
        </div>

        <div>
          <p className="mb-1.5 font-semibold text-foreground">
            1. Clerk Dashboard (production)
          </p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>
              Open{" "}
              <a
                href={CLERK_SSO_CONNECTIONS_URL}
                className="text-gold underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                SSO connections
              </a>{" "}
              → <strong>X / Twitter</strong>.
            </li>
            <li>
              Under <strong>Scopes</strong>, include all of:{" "}
              <code className="break-all text-foreground">
                {X_OAUTH_RECOMMENDED_SCOPES.join(" ")}
              </code>
            </li>
            <li>
              <strong>users.email</strong> is required — without it Clerk cannot
              create your account automatically.
            </li>
          </ol>
        </div>

        <div>
          <p className="mb-1.5 font-semibold text-foreground">
            2. X Developer Portal
          </p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>
              <a
                href="https://developer.x.com/en/portal/dashboard"
                className="text-gold underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                X Developer Portal
              </a>{" "}
              → your app → <strong>User authentication settings</strong>.
            </li>
            <li>
              <strong>Callback URI</strong>:{" "}
              <code className="break-all text-foreground">
                {CLERK_X_CALLBACK_URL}
              </code>
            </li>
            <li>
              <strong>Request email from users</strong> must be enabled.
            </li>
            <li>
              <strong>Type of App</strong> = Web App, Automated App or Bot.
            </li>
            <li>
              <strong>Client ID</strong> matches Clerk:{" "}
              <code className="break-all text-foreground">
                {CLERK_X_CLIENT_ID}
              </code>
            </li>
            <li>
              After saving, re-copy the <strong>Client Secret</strong> into
              Clerk → SSO connections → X.
            </li>
          </ol>
        </div>
      </div>
    </details>
  );
}