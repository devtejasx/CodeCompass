"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, Sparkles, User } from "lucide-react";

import { InlineText } from "@/components/inline-text";
import { Button } from "@/components/ui/button";
import { sendMentorMessage } from "@/app/actions/mentor";
// From ./constants, not ./limits: the latter is server-only, and the composer
// needs the same number the server enforces.
import { MAX_MESSAGE_CHARS } from "@/lib/ai/constants";
import { cn } from "@/lib/utils";

/**
 * The mentor conversation.
 *
 * Accessibility drives most of the decisions here. The transcript is a
 * `role="log"` with `aria-live="polite"`, so a screen reader announces a reply
 * when it arrives rather than leaving the user to go looking for it. The
 * pending state is announced too — silence during a slow request is
 * indistinguishable from a failure.
 *
 * The learner's question appears in the transcript immediately and stays there
 * if the request fails, because retyping a question you already asked is the
 * most annoying possible failure mode.
 */

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
}

export function MentorChat({
  conversationId,
  initialMessages,
  starters,
  available,
  unavailableReason,
}: {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  starters: readonly string[];
  /** False when no provider is configured — the page still works. */
  available: boolean;
  unavailableReason: string;
}) {
  const router = useRouter();

  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [conversation, setConversation] = React.useState(conversationId);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  function submit(text: string) {
    const question = text.trim();
    if (!question || pending) return;

    setError(null);
    setDraft("");

    // Optimistic: the question is theirs, and it should not vanish while they
    // wait — or if the request fails.
    const localId = `local-${messages.length}`;
    setMessages((current) => [
      ...current,
      { id: localId, role: "USER", content: question },
    ]);

    startTransition(async () => {
      const result = await sendMentorMessage({
        conversationId: conversation ?? undefined,
        message: question,
      });

      if (result.conversationId) setConversation(result.conversationId);

      if (!result.ok || !result.reply) {
        setError(result.error ?? "Something went wrong.");
        inputRef.current?.focus();
        return;
      }

      setMessages((current) => [
        ...current,
        { id: `${localId}-reply`, role: "ASSISTANT", content: result.reply! },
      ]);

      // Refreshes the conversation list in the sidebar.
      router.refresh();
      inputRef.current?.focus();
    });
  }

  const empty = messages.length === 0;

  return (
    // dvh rather than vh, so the composer sits above the on-screen keyboard
    // rather than behind the address bar that vh pretends is not there.
    <div className="flex min-h-[60dvh] flex-col">
      {!available ? (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <p className="flex items-start gap-2 text-sm font-medium text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your AI mentor isn&apos;t available on this deployment
          </p>
          <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
            {unavailableReason}
          </p>
        </div>
      ) : null}

      {/* ── Transcript ───────────────────────────────────────── */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with your mentor"
        aria-busy={pending}
        className="flex-1 space-y-4"
      >
        {empty ? (
          <div className="surface rounded-xl p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="size-4 text-indigo-400" aria-hidden />
              Ask about your own progress
            </p>
            <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
              Your mentor can see your roadmap position, what you have completed and
              what CodeCompass recommends next — so ask about your path rather than
              about programming in general.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <li key={starter}>
                  <button
                    type="button"
                    onClick={() => submit(starter)}
                    disabled={pending || !available}
                    className="rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {starter}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {pending ? (
          <div className="flex gap-3">
            <Avatar role="ASSISTANT" />
            <p className="pt-1.5 text-sm text-subtle-foreground">
              Your mentor is thinking…
            </p>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {error ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/[0.05] p-3 text-sm leading-relaxed text-rose-300"
        >
          {error}
        </p>
      ) : null}

      {/* ── Composer ─────────────────────────────────────────── */}
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
      >
        <label htmlFor="mentor-input" className="sr-only">
          Ask your mentor a question
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="mentor-input"
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter makes a new line — the convention
              // people already have from every other chat interface.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(draft);
              }
            }}
            rows={2}
            maxLength={MAX_MESSAGE_CHARS}
            disabled={pending || !available}
            placeholder={
              available
                ? "Ask about your roadmap, your practice, or a concept…"
                : "Unavailable on this deployment"
            }
            className="min-h-[3.25rem] flex-1 resize-y rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-subtle-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button type="submit" disabled={pending || !available || !draft.trim()}>
            <Send aria-hidden />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </div>

        <p className="mt-2 text-xs text-subtle-foreground">
          Your mentor can be wrong. It reads your CodeCompass progress — it cannot see
          your code, your GitHub account, or anything outside this app.
        </p>
      </form>
    </div>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "USER";

  return (
    <div className="flex gap-3">
      <Avatar role={message.role} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-subtle-foreground">
          {isUser ? "You" : "Mentor"}
        </p>
        {/*
          The same inline vocabulary the lessons use. A model writes `**bold**`
          and backticked identifiers whether or not anything renders them, so
          without this the learner reads the punctuation. `whitespace-pre-wrap`
          still carries the line breaks — InlineText only touches spans within
          a line.
        */}
        <div
          className={cn(
            "pretty mt-1 whitespace-pre-wrap text-sm leading-relaxed",
            isUser ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <InlineText text={message.content} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: ChatMessage["role"] }) {
  const isUser = role === "USER";

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface",
        isUser ? "text-muted-foreground" : "text-indigo-400",
      )}
    >
      {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
    </span>
  );
}
