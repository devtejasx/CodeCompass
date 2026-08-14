import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { MentorChat, type ChatMessage } from "@/components/mentor/mentor-chat";
import { requireOnboardedUser } from "@/lib/session";
import { getGuidance } from "@/lib/personalization/service";
import {
  getConversation,
  getLatestConversation,
  listConversations,
} from "@/lib/ai/conversations";
import { aiAvailability } from "@/lib/ai/provider";
import { STARTER_QUESTIONS } from "@/lib/ai/mentor";
import { remainingRequests } from "@/lib/ai/limits";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Mentor",
  robots: { index: false, follow: false },
};

/**
 * The AI mentor.
 *
 * A server component that loads the conversation and the learner's guidance,
 * then hands the chat to one client island. The page renders in full whether or
 * not a provider is configured: the deterministic next step is shown beside the
 * chat, so a learner whose mentor is unavailable still leaves with an answer to
 * "what should I do next?".
 *
 * That is the phase's central rule made visible — AI is an enhancement here,
 * never a dependency.
 */
export default async function MentorPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { c } = await searchParams;

  const availability = aiAvailability();

  const [guidance, conversations, conversation, remaining] = await Promise.all([
    getGuidance(user.id),
    listConversations(user.id),
    // Scoped by userId inside the query, so a conversation id from someone
    // else's URL simply is not found.
    c ? getConversation(user.id, c) : getLatestConversation(user.id),
    availability.configured ? remainingRequests(user.id) : Promise.resolve(0),
  ]);

  const messages: ChatMessage[] =
    conversation?.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    })) ?? [];

  const firstName = user.name.split(/\s+/)[0] || user.name;

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-40" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <header className="max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Sparkles className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your AI mentor
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Grounded in your actual progress. It knows where you are on your roadmap,
            what you have completed and what CodeCompass recommends next — and it will
            tell you when it does not know something rather than guessing.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* ── Chat ─────────────────────────────────────────── */}
          <div className="min-w-0">
            <MentorChat
              conversationId={conversation?.id ?? null}
              initialMessages={messages}
              starters={STARTER_QUESTIONS}
              available={availability.configured}
              unavailableReason="Your roadmap, your next step, your practice and your projects are all calculated by CodeCompass itself and work exactly as normal. Only the conversational mentor needs an AI provider."
            />
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* The deterministic answer, always present. This is what makes
                the mentor an enhancement rather than a dependency. */}
            {guidance.next ? (
              <section
                aria-labelledby="mentor-next-heading"
                className="surface rounded-xl p-5"
              >
                <h2
                  id="mentor-next-heading"
                  className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
                >
                  Your next step
                </h2>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {guidance.next.title}
                </p>
                <p className="pretty mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {guidance.next.reason}
                </p>
                <div className="mt-4">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={guidance.next.href}>
                      {guidance.next.action}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </div>
                <p className="mt-3 text-xs text-subtle-foreground">
                  Calculated from your progress, not by AI.
                </p>
              </section>
            ) : null}

            {conversations.length > 0 ? (
              <section
                aria-labelledby="mentor-history-heading"
                className="surface rounded-xl p-5"
              >
                <h2
                  id="mentor-history-heading"
                  className="text-xs font-medium uppercase tracking-label text-subtle-foreground"
                >
                  Your conversations
                </h2>

                <ul className="mt-3 flex flex-col gap-1">
                  {conversations.slice(0, 8).map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/mentor?c=${entry.id}`}
                        aria-current={
                          entry.id === conversation?.id ? "page" : undefined
                        }
                        className={cn(
                          "block truncate rounded-lg px-2 py-1.5 text-sm transition-colors",
                          entry.id === conversation?.id
                            ? "bg-surface-raised text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {entry.title ?? "Untitled conversation"}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href="/mentor?c=">
                      <MessageSquare aria-hidden />
                      New conversation
                    </Link>
                  </Button>
                </div>
              </section>
            ) : null}

            {availability.configured ? (
              <p className="px-1 text-xs text-subtle-foreground">
                {remaining} {remaining === 1 ? "question" : "questions"} left this hour.
              </p>
            ) : null}

            <p className="px-1 text-xs leading-relaxed text-subtle-foreground">
              {firstName}, your mentor never sees your password, your GitHub token or
              your submitted code — only your learning progress.
            </p>
          </aside>
        </div>
      </Container>
    </div>
  );
}
