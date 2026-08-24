import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

/**
 * Edge middleware is the *authentication* gate only: it answers "is there a
 * session?" without touching the database.
 *
 * The onboarding-completion gate is deliberately NOT here. Whether onboarding
 * is finished lives in Postgres, and reading it from a JWT would go stale the
 * moment a user completes the flow. Each protected page re-checks it against
 * the database instead (see src/lib/session.ts).
 */
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/practice",
  "/projects",
  "/academy",
  "/github",
  // The learner's own profile. /u/<username> is deliberately NOT here: a public
  // profile has to render for somebody with no account, and its own query
  // refuses anything that is not explicitly published.
  "/profile",
];
const AUTH_PAGES = ["/login", "/signup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth?.user);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    // Preserve intent so we can send them back after signing in.
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  // A signed-in user has no reason to see the login or signup pages.
  if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Skip static assets, image optimisation and the auth API routes.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
