import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { DecisionHelper } from "@/components/ai-tools/decision-helper";
import { requireOnboardedUser } from "@/lib/session";
import { listTools } from "@/lib/ai-tools/queries";

export const metadata: Metadata = {
  title: "Which AI tool should I use?",
  robots: { index: false, follow: false },
};

/** The guided decision interface. Rules, not a model call. */
export default async function ChooseToolPage() {
  const user = await requireOnboardedUser();
  const tools = await listTools(user.id);

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-fade-b opacity-50" />
      <Glow className="-top-40 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <Link
          href="/academy/ai-tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-3.5 rotate-180" aria-hidden />
          AI Tools Academy
        </Link>

        <header className="mt-6 max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Wand2 className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Which AI tool should I use?
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Answer two questions and we will narrow the catalog. The answer comes from
            fixed rules over what each tool documents about itself — no AI is asked, so
            the same answers always produce the same shortlist and nothing can be
            invented.
          </p>
        </header>

        <div className="mt-10 max-w-4xl">
          <DecisionHelper tools={tools} />
        </div>
      </Container>
    </div>
  );
}
