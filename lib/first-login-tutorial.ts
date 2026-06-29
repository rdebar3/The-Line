export const FIRST_LOGIN_TUTORIAL_STORAGE_KEY = "theline_first_login_tutorial";

export function readLocalFirstLoginTutorialComplete(userId: string) {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(`${FIRST_LOGIN_TUTORIAL_STORAGE_KEY}:${userId}`) ===
    "true"
  );
}

export function writeLocalFirstLoginTutorialComplete(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${FIRST_LOGIN_TUTORIAL_STORAGE_KEY}:${userId}`, "true");
}