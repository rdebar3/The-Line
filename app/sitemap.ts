import type { MetadataRoute } from "next";

const routes = [
  "",
  "/declaration",
  "/constitution",
  "/bill-of-rights",
  "/rights-under-pressure",
  "/arsenal",
  "/privacy",
  "/sign-in",
  "/sign-up",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://theline.app";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}