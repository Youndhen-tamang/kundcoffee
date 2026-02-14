import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. If user is NOT logged in and on a public page, let them through
    if (!token) {
      return NextResponse.next();
    }

    // 2. If user IS logged in and tries to access login/signup, redirect to dashboard
    if (path === "/login" || path === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3. Check Email Verification
    if (!token.emailVerified && path !== "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }

    // 4. Check Store Setup
    if (token.emailVerified && !token.isSetupComplete && path !== "/setup-store") {
      return NextResponse.redirect(new URL("/setup-store", req.url));
    }

    // 5. Cleanup: Prevent accessing Auth pages if everything is already complete
    if (token.emailVerified && path === "/verify-email") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
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
        // ALLOW these paths to be viewed without a token
        if (path === "/login" || path === "/signup") {
          return true;
        }
        // REQUIRE a token for everything else in the matcher
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
    "/settings/:path*",
    "/orders/:path*",
    "/menu/:path*",
    "/finance/:path*",
  ],
};