import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/declaration(.*)",
  "/constitution(.*)",
  "/bill-of-rights(.*)",
  "/rights-under-pressure(.*)",
  "/arsenal(.*)",
  "/privacy(.*)",
  "/purchase/success(.*)",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // API routes return JSON 401/403 from handlers — avoid middleware redirects
  if (isApiRoute(request)) {
    return;
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Clerk production proxy serves JS bundles under /__clerk — must bypass the .js exclusion below.
    "/__clerk(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};