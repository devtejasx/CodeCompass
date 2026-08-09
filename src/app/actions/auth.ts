"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { BCRYPT_ROUNDS } from "@/lib/auth/credentials";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

export interface FormState {
  ok: boolean;
  /** Message shown above the form. Never contains internal error detail. */
  error?: string;
  /** Field-level messages keyed by input name. */
  fieldErrors?: Record<string, string>;
  /**
   * Non-sensitive values echoed back so a rejected submission doesn't wipe the
   * form — React 19 resets uncontrolled inputs to their defaultValue after an
   * action runs. Passwords are deliberately never echoed.
   */
  values?: { name?: string; email?: string };
}

const GENERIC_ERROR = "Something went wrong on our end. Please try again in a moment.";

function fieldErrorsFrom(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = typeof issue.path[0] === "symbol" ? "" : String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Registers a user and signs them in.
 *
 * Everything is re-validated here — the client schema is the same one, but the
 * server never assumes the client ran it.
 */
export async function registerUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Kept verbatim so a rejected submission can repopulate the form.
  const submitted = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = signUpSchema.safeParse({
    ...submitted,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      values: submitted,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return {
        ok: false,
        fieldErrors: {
          email: "An account with this email already exists. Try signing in.",
        },
        values: submitted,
      };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // The profile row is created up front so onboarding always has somewhere
    // to write, and so onboardingCompleted has a definite `false`.
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: { create: {} },
      },
    });
  } catch (error) {
    // Unique-constraint violation from a race between the check and the insert.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        ok: false,
        fieldErrors: {
          email: "An account with this email already exists. Try signing in.",
        },
        values: submitted,
      };
    }

    console.error("[registerUser] failed to create user");
    return { ok: false, error: GENERIC_ERROR, values: submitted };
  }

  // Outside the try: signIn throws a redirect that must not be caught.
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/onboarding",
  });

  return { ok: true };
}

/** Signs an existing user in. Routing after login is decided by /dashboard. */
export async function loginUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const callbackUrl = String(formData.get("callbackUrl") || "/dashboard");
  const submitted = { email: String(formData.get("email") ?? "") };

  const parsed = signInSchema.safeParse({
    email: submitted.email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      values: submitted,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Deliberately identical for "no such user" and "wrong password" so the
      // form can't be used to discover which emails are registered.
      return {
        ok: false,
        error: "That email and password don't match. Please try again.",
        values: submitted,
      };
    }
    throw error; // redirect signals land here and must propagate
  }

  return { ok: true };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
