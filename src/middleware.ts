import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Quick first check: no login cookie means straight to /login.
// Each private page also checks the session properly on the server.
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/plan/:path*", "/replan/:path*", "/grocery/:path*", "/account/:path*", "/upgrade/:path*"],
};
