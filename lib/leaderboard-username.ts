const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "moderator",
  "theline",
  "nofacepatriot",
  "defender",
  "system",
]);

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();

  if (!USERNAME_PATTERN.test(trimmed)) {
    return "Usernames must be 3–20 characters: letters, numbers, and underscores only.";
  }

  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return "That username is reserved.";
  }

  return null;
}