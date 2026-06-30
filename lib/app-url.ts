export const OFFICIAL_APP_URL = "https://the-line-eight.vercel.app";

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? OFFICIAL_APP_URL;
}