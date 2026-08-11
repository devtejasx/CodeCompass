import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, GitCompare, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { ToolPicker } from "@/components/ai-tools/tool-picker";
import { requireOnboardedUser } from "@/lib/session";
import { getComparison, listTools } from "@/lib/ai-tools/queries";
import { parseComparisonSlugs } from "@/lib/ai-tools/compare";
import {
  ENVIRONMENT_SHORT,
  STATUS_LABEL,
  USE_CASE_LABEL,
  formatVerified,
} from "@/lib/ai-tools/labels";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { aiToolIcon } from "@/lib/ai-tools/icons";

export const metadata: Metadata = {
  title: "Compare AI tools",
  robots: { index: false, follow: false },
};

/**
 * Side-by-side comparison of two or three tools.
 *
 * There is deliberately no score, no ranking and no "winner" column. Different
 * tools are useful for different purposes, and a table that declared one best
 * would be making a claim CodeCompass has no basis for — the honest output is
 * the facts, arranged so a reader can decide.
 *
 * The selection lives in the URL, so the table itself is a server component and
 * only the picker is interactive.
 */
export default async function CompareToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { tools: raw } = await searchParams;

  const requested = parseComparisonSlugs(raw);

  const [all, selected] = await Promise.all([
    listTools(user.id),
    getComparison(requested),
  ]);

  const pickerTools = all.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    category: tool.category.name,
  }));

  // Every capability mentioned by any selected tool, so a blank cell means
  // "this tool does not document that", which is itself the useful signal.
  const capabilityRows = [
    ...new Set(
      selected.flatMap((tool) => tool.capabilities.map((entry) => entry.capability)),
    ),
  ].sort((a, b) => a.localeCompare(b));

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
            <GitCompare className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Compare AI tools
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground">
            Up to three side by side. There is no score and no winner here — these
            tools do overlapping jobs in different ways, and which one is right
            depends on what you are doing.
          </p>
        </header>

        <div className="mt-8 max-w-4xl">
          <ToolPicker tools={pickerTools} selected={selected.map((t) => t.slug)} />
        </div>

        {selected.length === 0 ? (
          <p className="mt-10 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Nothing selected yet. Pick two tools you are genuinely choosing between —
            an editor assistant against another editor assistant, say, rather than a
            chatbot against an API.
          </p>
        ) : (
          <>
            <p className="mt-8 flex max-w-prose items-start gap-2 text-sm leading-relaxed text-subtle-foreground">
              <Scale className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
              An empty cell means the tool does not document that capability — not
              that it is worse. Read the two &quot;when not to use&quot; rows first;
              they are usually more decisive than the capability list.
            </p>

            {/* Wide tables scroll inside their own container so the page never
                overflows horizontally on a phone. */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">
                  Comparison of {selected.map((tool) => tool.name).join(", ")}
                </caption>

                <thead>
                  <tr>
                    <th scope="col" className="w-40 p-3 text-left align-bottom">
                      <span className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                        Tool
                      </span>
                    </th>
                    {selected.map((tool) => {
                      const Icon = aiToolIcon(tool.iconIdentifier);
                      return (
                        <th
                          key={tool.slug}
                          scope="col"
                          className="border-l border-border p-3 text-left align-bottom"
                        >
                          <Link
                            href={`/academy/ai-tools/${tool.slug}`}
                            className="group flex flex-col gap-2"
                          >
                            <span
                              aria-hidden
                              className="grid size-8 place-items-center rounded-lg border border-border bg-surface text-indigo-400"
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="text-base font-medium text-foreground transition-colors group-hover:text-indigo-300">
                              {tool.name}
                            </span>
                          </Link>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  <Row label="Primary use">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>{tool.primaryUse}</Cell>
                    ))}
                  </Row>

                  <Row label="Category">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>{tool.category.name}</Cell>
                    ))}
                  </Row>

                  <Row label="Environment">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        {tool.environments.length > 0
                          ? tool.environments
                              .map((env) => ENVIRONMENT_SHORT[env])
                              .join(", ")
                          : "—"}
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Learning difficulty">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <Badge variant={DIFFICULTY_BADGE[tool.difficulty]}>
                          {DIFFICULTY_SHORT[tool.difficulty]}
                        </Badge>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Status">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <span
                          className={
                            tool.status === "DEPRECATED"
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }
                        >
                          {STATUS_LABEL[tool.status]}
                        </span>
                        {tool.statusNote ? (
                          <span className="mt-1 block text-xs text-subtle-foreground">
                            {tool.statusNote}
                          </span>
                        ) : null}
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Best for">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <ul className="flex flex-col gap-1">
                          {tool.useCases.slice(0, 4).map((entry) => (
                            <li key={entry.useCase}>{USE_CASE_LABEL[entry.useCase]}</li>
                          ))}
                        </ul>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="When to use it">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <ul className="flex flex-col gap-1.5">
                          {tool.whenToUse.slice(0, 3).map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="When not to use it">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <ul className="flex flex-col gap-1.5">
                          {tool.whenNotToUse.slice(0, 3).map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Limitations">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <ul className="flex flex-col gap-1.5">
                          {tool.limitations.slice(0, 3).map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      </Cell>
                    ))}
                  </Row>

                  {capabilityRows.length > 0 ? (
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={selected.length + 1}
                        className="border-t border-border pb-1 pt-6 text-left"
                      >
                        <span className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
                          Documented capabilities
                        </span>
                      </th>
                    </tr>
                  ) : null}

                  {capabilityRows.map((capability) => (
                    <Row key={capability} label={capability}>
                      {selected.map((tool) => {
                        const has = tool.capabilities.some(
                          (entry) => entry.capability === capability,
                        );
                        return (
                          <Cell key={tool.slug}>
                            {/* A word, not a tick: never colour or glyph alone. */}
                            <span
                              className={
                                has ? "text-emerald-400" : "text-subtle-foreground"
                              }
                            >
                              {has ? "Yes" : "Not documented"}
                            </span>
                          </Cell>
                        );
                      })}
                    </Row>
                  ))}

                  <Row label="Official documentation">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>
                        <a
                          href={tool.docsUrl ?? tool.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-300 transition-colors hover:text-indigo-200"
                        >
                          Open
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Last verified">
                    {selected.map((tool) => (
                      <Cell key={tool.slug}>{formatVerified(tool.lastVerifiedAt)}</Cell>
                    ))}
                  </Row>
                </tbody>
              </table>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border align-top">
      <th scope="row" className="p-3 text-left text-xs font-medium text-subtle-foreground">
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-l border-border p-3 leading-relaxed text-muted-foreground">
      {children}
    </td>
  );
}
