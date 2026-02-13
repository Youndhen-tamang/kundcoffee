import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. If user IS logged in and tries to access login/signup, redirect to dashboard
    if (token && (path === "/login" || path === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. If user is NOT logged in, let withAuth handle redirection to /login
    if (!token) return null;

    // 3. Check Email Verification
    // If NOT verified and NOT already on /verify-email, redirect there
    if (!token.emailVerified && path !== "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email", req.url));
    }

    // 4. Check Store Setup
    // If verified BUT store NOT setup, and NOT already on /setup-store
    if (
      token.emailVerified &&
      !token.isSetupComplete &&
      path !== "/setup-store"
    ) {
      return NextResponse.redirect(new URL("/setup-store", req.url));
    }

    // 5. Prevent accessing Auth pages if everything is already complete
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
      authorized: ({ token }) => !!token,
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
