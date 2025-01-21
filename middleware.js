import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(.*)", // Allow the root route
  "/api/webhooks(.*)", // Allow webhooks
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if the current request is to a public route
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Enforce authentication for protected routes
  const { userId } = auth;

  if (!userId) {
    const signUpUrl = new URL("/sign-up", req.url);
    return NextResponse.redirect(signUpUrl); // Redirect unauthenticated users to the signup page
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Exclude Next.js internals and static assets:
     * - /_next: Next.js internal paths
     * - Files with common static extensions (html, css, js, images, fonts, etc.)
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // Always include API routes (except /api/webhooks, handled separately)
    "/(api|trpc)(.*)",
  ],
};
