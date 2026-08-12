"use client";

import * as React from "react";

import { startTopic } from "@/app/actions/learn";

/**
 * Records that the learner opened this topic.
 *
 * Renders nothing. It exists so that opening a lesson is a real event: it sets
 * `startedAt` and `lastAccessedAt`, which is what "continue where you left off"
 * reads, and it puts the topic in the activity feed for someone who reads a
 * lesson without ticking a single section.
 *
 * Deliberately a client effect rather than a call inside the page's render. A
 * Server Component render must stay a read — writing there makes a GET
 * non-idempotent, and `revalidatePath` inside a render is an error in Next.
 * The action deduplicates against the learner's most recent activity, so a
 * refresh, a double mount in Strict Mode or a back-navigation adds nothing.
 */
export function TopicOpened({ topicId }: { topicId: string }) {
  const recorded = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (recorded.current === topicId) return;
    recorded.current = topicId;

    // Fire and forget: failing to record that a page was opened must never
    // surface to the learner, and the action swallows its own errors already.
    void startTopic({ topicId });
  }, [topicId]);

  return null;
}
