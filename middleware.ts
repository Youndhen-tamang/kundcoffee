import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const isAuthPage = path === "/login" || path === "/signup";
  const isVerifyPage = path === "/verify-email";
  const isSetupPage = path === "/setup-store";

  // 1. If user is NOT logged in
  if (!token) {
    // If they are trying to access a protected page, send to login
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // If they are on login/signup, let them through
    return NextResponse.next();
  }

  // 2. If user IS logged in, don't let them see Login/Signup
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Email Verification Check
  if (!token.emailVerified && !isVerifyPage) {
    const url = new URL("/verify-email", req.url);
    if (token.email) url.searchParams.set("email", token.email as string);
    return NextResponse.redirect(url);
  }

  // 4. Setup Check
  if (token.emailVerified && !token.isSetupComplete && !isSetupPage) {
    return NextResponse.redirect(new URL("/setup-store", req.url));
  }

  // 5. Cleanup: Prevent accessing verify/setup if already finished
  if (token.emailVerified && isVerifyPage) {
    const target = token.isSetupComplete ? "/" : "/setup-store";
    return NextResponse.redirect(new URL(target, req.url));
  }
  
  if (token.isSetupComplete && isSetupPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Ensure the middleware runs for these paths
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