const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "moderator",
  "theline",
  "nofacepatriot",
  "defender",
  "system",
]);

export const DEFAULT_USERNAME_FALLBACK = "Anonymous_Defender";

const DEFAULT_PATRIOT_PATTERN = /^Patriot-\d{4,6}$/;
const DEFAULT_ANONYMOUS_PATTERN = /^Anonymous_Defender(?:_\d{4})?$/;

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();

  if (!USERNAME_PATTERN.test(trimmed)) {
    return "Call signs must be 3–20 characters: letters, numbers, hyphens, and underscores only.";
  }

  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return "That call sign is reserved.";
  }

  return null;
}

export function generatePatriotCallsign(): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `Patriot-${digits}`;
}

export function isDefaultLeaderboardUsername(username: string | null): boolean {
  if (!username) return true;
  return (
    DEFAULT_PATRIOT_PATTERN.test(username) ||
    DEFAULT_ANONYMOUS_PATTERN.test(username)
  );
}

export function formatLeaderboardDisplayName(username: string): string {
  if (username.startsWith("Anonymous_Defender")) {
    return "Anonymous Defender";
  }
  return username;
}