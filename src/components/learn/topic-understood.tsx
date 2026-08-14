"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { markTopicUnderstood } from "@/app/actions/learn";
import { Button } from "@/components/ui/button";

/**
 * "I already know this" for a topic with no authored lesson.
 *
 * Worded as an attestation throughout. CodeCompass has not taught this topic
 * and cannot test it, so the button must not look like it is awarding
 * something — it is the learner telling the roadmap to move on, and the copy
 * says exactly that.
 */
export function TopicUnderstood({
  topicId,
  initiallyCompleted,
}: {
  topicId: string;
  initiallyCompleted: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = React.useState(initiallyCompleted);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (done) {
    return (
      <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2 text-sm text-emerald-400">
        <Check className="size-4" aria-hidden />
        Marked as understood — the topics after this one are unlocked.
      </p>
    );
  }

  const confirm = async () => {
    setPending(true);
    setError(null);

    const result = await markTopicUnderstood({ topicId });

    if (!result.ok) {
      setPending(false);
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setDone(true);
    setPending(false);
    // The roadmap, the dashboard's next step and this page's own state all
    // read from the server, so refresh rather than patching them by hand.
    router.refresh();
  };

  return (
    <div className="mt-6">
      <Button variant="secondary" onClick={confirm} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          <>
            <Check aria-hidden />I already know this — continue
          </>
        )}
      </Button>

      <p className="mt-2 max-w-[52ch] text-xs leading-relaxed text-subtle-foreground">
        This records your own judgement, not a test result. It unlocks the topics that
        come after this one so your roadmap keeps moving while the lesson is being
        written.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-3 py-2 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
