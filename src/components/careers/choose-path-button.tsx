"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { selectCareer } from "@/app/actions/career";
import { Button } from "@/components/ui/button";

interface ChoosePathButtonProps {
  careerId: string;
  careerName: string;
  /** Null when signed out — the button becomes a prompt to sign in instead. */
  isAuthenticated: boolean;
  /** True when this career is already the user's chosen path. */
  isCurrent: boolean;
  slug: string;
  size?: "md" | "lg";
}

export function ChoosePathButton({
  careerId,
  careerName,
  isAuthenticated,
  isCurrent,
  slug,
  size = "lg",
}: ChoosePathButtonProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Button size={size} asChild>
        {/* Signed-out visitors can read everything; choosing needs an account. */}
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/careers/${slug}`)}`}>
          Sign in to choose this path
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    );
  }

  if (isCurrent) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-2 text-sm font-medium text-emerald-400">
          <Check className="size-4" aria-hidden />
          This is your current path
        </span>
        <Button variant="secondary" size={size} asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  const choose = async () => {
    setPending(true);
    setError(null);

    const result = await selectCareer({ careerId });

    if (!result.ok) {
      setPending(false);
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Kept pending through navigation so the button can't be clicked twice.
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <Button size={size} onClick={choose} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Saving your choice…
          </>
        ) : (
          <>
            Choose {careerName}
            <ArrowRight aria-hidden />
          </>
        )}
      </Button>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
