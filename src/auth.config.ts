import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the Auth.js configuration.
 *
 * Middleware runs on the edge runtime, where Prisma and bcrypt cannot load.
 * This file therefore contains no providers and no database access — those live
 * in src/auth.ts, which only ever runs in Node.
 */
export const authConfig = {
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
