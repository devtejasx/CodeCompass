import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

// Auth.js' signIn/signOut perform framework redirects that need a request
// context. The surrounding logic — validation, hashing, duplicate detection —
// is what these tests exercise, so those two calls are stubbed.
const signIn = vi.fn();
const signOut = vi.fn();
vi.mock("@/auth", () => ({ signIn, signOut, auth: vi.fn() }));

// next-auth's entrypoint pulls in Next server internals that don't resolve
// outside a Next runtime. Only AuthError is used by the action under test.
class MockAuthError extends Error {}
vi.mock("next-auth", () => ({ AuthError: MockAuthError }));

const { registerUser, loginUser, logout } = await import("@/app/actions/auth");
const { verifyCredentials } = await import("@/lib/auth/credentials");
const { db } = await import("@/lib/db");

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "Analytical1",
  confirmPassword: "Analytical1",
};

beforeEach(() => {
  signIn.mockReset();
  signOut.mockReset();
});

describe("registration", () => {
  it("creates a user with a hashed password and a profile", async () => {
    const result = await registerUser({ ok: false }, form(VALID));
    expect(result.ok).toBe(true);

    const user = await db.user.findUnique({
      where: { email: "ada@example.com" },
      include: { profile: true },
    });

    expect(user).not.toBeNull();
    expect(user!.name).toBe("Ada Lovelace");

    // Never stored in plaintext, and a real bcrypt hash.
    expect(user!.passwordHash).not.toBe(VALID.password);
    expect(user!.passwordHash.startsWith("$2")).toBe(true);
    expect(await bcrypt.compare(VALID.password, user!.passwordHash)).toBe(true);

    // Onboarding has somewhere to write, and starts explicitly incomplete.
    expect(user!.profile).not.toBeNull();
    expect(user!.profile!.onboardingCompleted).toBe(false);

    // The new account is signed in and sent to onboarding.
    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ redirectTo: "/onboarding" }),
    );
  });

  it("normalises the email to lowercase", async () => {
    await registerUser({ ok: false }, form({ ...VALID, email: "ADA@Example.COM" }));
    expect(
      await db.user.findUnique({ where: { email: "ada@example.com" } }),
    ).not.toBeNull();
  });

  it("rejects a duplicate email without creating a second user", async () => {
    await registerUser({ ok: false }, form(VALID));
    signIn.mockReset();

    const result = await registerUser({ ok: false }, form(VALID));

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.email).toMatch(/already exists/i);
    expect(signIn).not.toHaveBeenCalled();
    expect(await db.user.count()).toBe(1);
  });

  it("rejects a duplicate email regardless of casing", async () => {
    await registerUser({ ok: false }, form(VALID));
    const result = await registerUser(
      { ok: false },
      form({ ...VALID, email: "ADA@EXAMPLE.COM" }),
    );

    expect(result.ok).toBe(false);
    expect(await db.user.count()).toBe(1);
  });

  it("rejects a weak password server-side", async () => {
    const result = await registerUser(
      { ok: false },
      form({ ...VALID, password: "short", confirmPassword: "short" }),
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.password).toBeTruthy();
    expect(await db.user.count()).toBe(0);
  });

  it("rejects mismatched password confirmation", async () => {
    const result = await registerUser(
      { ok: false },
      form({ ...VALID, confirmPassword: "Different1" }),
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.confirmPassword).toMatch(/match/i);
    expect(await db.user.count()).toBe(0);
  });

  it("rejects an invalid email", async () => {
    const result = await registerUser(
      { ok: false },
      form({ ...VALID, email: "not-an-email" }),
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.email).toBeTruthy();
    expect(await db.user.count()).toBe(0);
  });
});

describe("login", () => {
  beforeEach(async () => {
    await registerUser({ ok: false }, form(VALID));
    signIn.mockReset();
  });

  it("verifies correct credentials and never returns the hash", async () => {
    const user = await verifyCredentials({
      email: "ada@example.com",
      password: VALID.password,
    });

    expect(user).not.toBeNull();
    expect(user!.email).toBe("ada@example.com");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("accepts a differently-cased email", async () => {
    const user = await verifyCredentials({
      email: "Ada@Example.com",
      password: VALID.password,
    });
    expect(user).not.toBeNull();
  });

  it("rejects a wrong password", async () => {
    const user = await verifyCredentials({
      email: "ada@example.com",
      password: "WrongPassword1",
    });
    expect(user).toBeNull();
  });

  it("rejects an unknown email", async () => {
    const user = await verifyCredentials({
      email: "nobody@example.com",
      password: VALID.password,
    });
    expect(user).toBeNull();
  });

  it("rejects malformed input without throwing", async () => {
    expect(await verifyCredentials({})).toBeNull();
    expect(await verifyCredentials(null)).toBeNull();
    expect(await verifyCredentials({ email: "x", password: "" })).toBeNull();
  });

  it("passes the credentials through to Auth.js on submit", async () => {
    await loginUser(
      { ok: false },
      form({
        email: "ada@example.com",
        password: VALID.password,
        callbackUrl: "/dashboard",
      }),
    );

    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ redirectTo: "/dashboard" }),
    );
  });

  it("refuses an off-site callbackUrl", async () => {
    await loginUser(
      { ok: false },
      form({
        email: "ada@example.com",
        password: VALID.password,
        callbackUrl: "https://evil.example/steal",
      }),
    );

    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ redirectTo: "/dashboard" }),
    );
  });
});

describe("logout", () => {
  it("signs out and returns to the landing page", async () => {
    await logout();
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});
