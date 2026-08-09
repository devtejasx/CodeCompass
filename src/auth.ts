import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { verifyCredentials } from "@/lib/auth/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Server-side validation and password comparison live in one testable
      // place; the login form's client checks are a convenience only.
      authorize: (credentials) => verifyCredentials(credentials),
    }),
  ],
});
