import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. If not logged in, 'authorized' callback below handles the redirect to /login
    if (!token) return NextResponse.next();

    // 2. Already logged in? Don't let them see Login/Signup
    if (path === "/login" || path === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3. Email Verification Check
    // If NOT verified and NOT on the verify page -> Send to verify
    if (!token.emailVerified && path !== "/verify-email") {
      const url = new URL("/verify-email", req.url);
      if (token.email) url.searchParams.set("email", token.email as string);
      return NextResponse.redirect(url);
    }

    // 4. Setup Check
    // If Verified but NOT setup and NOT on setup page -> Send to setup
    if (token.emailVerified && !token.isSetupComplete && path !== "/setup-store") {
      return NextResponse.redirect(new URL("/setup-store", req.url));
    }

    // 5. Cleanup: Prevent accessing verify/setup if already finished
    if (token.emailVerified && path === "/verify-email") {
      // If email is verified but setup isn't, go to setup. Else go to dashboard.
      const target = token.isSetupComplete ? "/dashboard" : "/setup-store";
      return NextResponse.redirect(new URL(target, req.url));
    }
    
    if (token.isSetupComplete && path === "/setup-store") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Public paths that don't need a token
        if (path === "/login" || path === "/signup") return true;
        // All other paths in 'config' require a token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/verify-email",
    "/setup-store",
    "/login",
    "/signup",
  ],
};