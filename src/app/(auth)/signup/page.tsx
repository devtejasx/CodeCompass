import type { Metadata } from "next";

import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Start your journey into tech with a personalized path from CodeCompass.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Start your journey
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Create an account and we&apos;ll help you work out where to begin.
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
