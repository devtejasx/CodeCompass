"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Unlink } from "lucide-react";

import { disconnectGitHub } from "@/app/actions/github";
import { Button } from "@/components/ui/button";

/**
 * Disconnecting, with the consequences stated before the confirmation.
 *
 * Two steps on purpose. The first click explains exactly what happens — and
 * what does not — because "disconnect" is a word people reasonably worry might
 * mean "delete my repositories".
 */
export function DisconnectGitHub({ username }: { username: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const disconnect = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await disconnectGitHub();
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error ?? "That could not be disconnected.");
        setPending(false);
      }
    } catch {
      setError("That could not be disconnected. Please try again.");
      setPending(false);
    }
  };

  if (!confirming) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          <Unlink aria-hidden />
          Disconnect GitHub
        </Button>
        {error ? (
          <p className="mt-2 text-xs text-rose-300" role="status">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface/60 p-4">
      <p className="text-sm font-medium text-foreground">
        Disconnect @{username} from CodeCompass?
      </p>

      <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
        <li>
          Your GitHub connection is removed from CodeCompass, and we ask GitHub to
          forget the authorisation.
        </li>
        <li>
          <span className="text-foreground">
            Your repositories will not be deleted or changed.
          </span>{" "}
          Nothing on GitHub is touched.
        </li>
        <li>
          Repositories already linked to your projects stay recorded, so reconnecting
          later picks up where you left off.
        </li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void disconnect()} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Yes, disconnect
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-rose-300" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
