import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { CHARACTER_NAME } from "@/lib/guardian";
import { EDUCATIONAL_DISCLAIMER } from "@/lib/legal-disclaimers";

export const metadata = {
  title: "Privacy | The Line",
  description: "Privacy policy for The Line civic education platform.",
};

export default function PrivacyPage() {
  return (
    <PageShell showBack maxWidth="4xl" compactFooter>
      <article className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <p className="section-eyebrow">Legal</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-wide text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The Line (&quot;we,&quot; &quot;us&quot;) is a civic education
            platform guided by {CHARACTER_NAME}. This policy explains what
            information we collect and how we use it.
          </p>

          <h2 className="font-heading text-base font-semibold text-foreground">
            Information we collect
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground/90">Account data</strong>{" "}
              — email and profile information via Clerk when you sign up or sign
              in.
            </li>
            <li>
              <strong className="text-foreground/90">Training progress</strong>{" "}
              — Defender Score, rank, streaks, and mission progress stored
              locally and, when configured, synced to our database.
            </li>
            <li>
              <strong className="text-foreground/90">Leaderboard name</strong>{" "}
              — optional public username you choose for the Defender
              Leaderboard.
            </li>
            <li>
              <strong className="text-foreground/90">Payment status</strong>{" "}
              — Stripe processes payments; we store whether Full Access is
              unlocked on your account.
            </li>
            <li>
              <strong className="text-foreground/90">AI interactions</strong>{" "}
              — questions you submit to constitutional counsel and training
              features are sent to xAI (Grok) to generate responses.
            </li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-foreground">
            How we use information
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Provide training, progress tracking, and account features</li>
            <li>Process one-time Full Access purchases</li>
            <li>Operate leaderboard and cloud save features</li>
            <li>Improve platform reliability and security</li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-foreground">
            Third-party services
          </h2>
          <p>
            We use Clerk (authentication), Stripe (payments), Upstash Redis
            (data storage), Vercel (hosting), and xAI (AI responses). Each
            provider has its own privacy policy governing how they handle data.
          </p>

          <h2 className="font-heading text-base font-semibold text-foreground">
            Educational disclaimer
          </h2>
          <p>{EDUCATIONAL_DISCLAIMER}</p>

          <h2 className="font-heading text-base font-semibold text-foreground">
            Contact
          </h2>
          <p>
            For privacy questions, contact the operator of The Line through
            your usual support channel.
          </p>
        </section>

        <p className="text-center text-sm">
          <Link href="/" className="text-gold hover:underline">
            Return to The Line
          </Link>
        </p>
      </article>
    </PageShell>
  );
}