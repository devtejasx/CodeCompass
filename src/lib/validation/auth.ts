import { z } from "zod";

/**
 * Shared by the client form and the server action. The server re-parses every
 * submission with these exact schemas — client validation is a convenience,
 * never a trust boundary.
 */

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .toLowerCase();

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Passwords can be at most 72 characters.") // bcrypt truncates past 72
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Tell us what to call you.")
      .max(80, "That name is a little too long."),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
