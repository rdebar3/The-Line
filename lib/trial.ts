/**
 * 7-day full-access trial.
 *
 * Every signed-in account gets full premium access for TRIAL_DAYS from the
 * moment the Clerk account was created. No extra storage: the trial window is
 * derived from `user.createdAt`, which is available on both the client
 * (useUser) and the server (clerkClient). After the window closes without a
 * purchase, the account falls back to the free tier and the existing $4.99
 * one-time unlock.
 */

export const TRIAL_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
export const TRIAL_LENGTH_MS = TRIAL_DAYS * DAY_MS;

export const TRIAL_OFFER_LABEL = `Free for ${TRIAL_DAYS} days, then one-time $4.99`;
export const TRIAL_ENDED_MESSAGE =
  "Your free trial has ended. Unlock full access once — keep it forever.";

export type TrialState = {
  active: boolean;
  /** ISO timestamp the trial ends (null when no trial applies). */
  endsAt: string | null;
  /** Whole days remaining, rounded up. 0 when inactive. */
  daysRemaining: number;
};

const INACTIVE: TrialState = { active: false, endsAt: null, daysRemaining: 0 };

/**
 * Computes trial state from an account-creation timestamp.
 * Premium purchasers never show as "on trial".
 */
export function getTrialState(
  createdAt: Date | string | number | null | undefined,
  isPremium: boolean,
  now: number = Date.now()
): TrialState {
  if (isPremium || createdAt == null) return INACTIVE;

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return INACTIVE;

  const endsAtMs = created + TRIAL_LENGTH_MS;
  const msRemaining = endsAtMs - now;

  if (msRemaining <= 0) {
    return {
      active: false,
      endsAt: new Date(endsAtMs).toISOString(),
      daysRemaining: 0,
    };
  }

  return {
    active: true,
    endsAt: new Date(endsAtMs).toISOString(),
    daysRemaining: Math.min(TRIAL_DAYS, Math.ceil(msRemaining / DAY_MS)),
  };
}
