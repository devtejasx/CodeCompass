import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the Auth.js configuration.
 *
 * Middleware runs on the edge runtime, where Prisma and bcrypt cannot load.
 * This file therefore contains no providers and no database access — those live
 * in src/auth.ts, which only ever runs in Node.
 */
export const authConfig = {
  /**
   * Auth.js refuses to serve a request whose Host header it has not been told
   * to trust, because that header is attacker-controlled and is what callback
   * URLs get built from.
   *
   * It infers trust automatically on Vercel and in development. Anywhere else —
   * `next start` behind a reverse proxy, a container, a plain Node host — it
   * does not, and every auth route fails with `UntrustedHost`. Sign-in returns
   * the user to /login with no error, which reads as "wrong password" rather
   * than as a misconfiguration, and the development build gives no warning
   * because development is trusted implicitly.
   *
   * Setting it here rather than in src/auth.ts is deliberate: the middleware
   * builds its own Auth.js instance from this config and hits the same check,
   * so trusting it in only one of the two leaves the other broken.
   *
   * `AUTH_TRUST_HOST` still overrides this if a deployment wants to opt out.
   */
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    // Credentials sign-in requires JWT sessions; there is no session table.
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
