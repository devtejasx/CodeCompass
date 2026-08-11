import type { AIToolEnvironment, AIUseCase } from "@/generated/prisma/client";

import { ENVIRONMENT_LABEL, USE_CASE_LABEL } from "./labels";
import type { AIToolListItem } from "./queries";

/**
 * "Which AI tool should I use?"
 *
 * Deterministic rules over the catalog's own data. No model is called to answer
 * this — which is not a limitation, it is the correct design. The answer is a
 * lookup over relationships CodeCompass already stores (tool → use case, tool →
 * environment), so it is reproducible, explainable, free, and cannot invent a
 * tool that does not exist. Asking an AI which AI to use would be all four of
 * those things in reverse.
 *
 * The interface is two questions because two is what the data supports
 * honestly. A third question would be a guess dressed as guidance.
 */

export interface DecisionAnswer {
  useCase: AIUseCase | null;
  environment: AIToolEnvironment | null;
}

export interface DecisionResult {
  tools: AIToolListItem[];
  /** One sentence naming the rule that produced this list. */
  explanation: string;
  /**
   * True when the environment filter was dropped because nothing matched both
   * answers. The UI says so rather than silently answering a different
   * question.
   */
  relaxedEnvironment: boolean;
}

/**
 * Which environments are worth offering for a given goal.
 *
 * Derived from the catalog rather than hardcoded, so a tool gaining a CLI or a
 * new category of tool appearing changes the questions automatically. Returned
 * in the canonical display order.
 */
export function environmentsFor(
  tools: AIToolListItem[],
  useCase: AIUseCase | null,
): AIToolEnvironment[] {
  const relevant = useCase
    ? tools.filter((tool) => tool.useCaseKinds.includes(useCase))
    : tools;

  const found = new Set<AIToolEnvironment>();
  for (const tool of relevant) {
    for (const environment of tool.environments) found.add(environment);
  }

  return (["IDE", "BROWSER", "TERMINAL", "API", "PLATFORM"] as const).filter(
    (environment) => found.has(environment),
  );
}

/**
 * Applies the rules and explains itself.
 *
 * Deprecated tools are excluded from recommendations — that is the whole point
 * of the status field. They remain findable by search and by direct link, so a
 * learner chasing an old name still gets an answer; they just never appear as
 * an answer to "what should I use".
 */
export function decide({
  tools,
  answers,
  limit = 6,
}: {
  tools: AIToolListItem[];
  answers: DecisionAnswer;
  limit?: number;
}): DecisionResult {
  const current = tools.filter((tool) => tool.status !== "DEPRECATED");

  if (!answers.useCase) {
    return {
      tools: [],
      explanation: "Pick what you are trying to do and we will narrow the catalog.",
      relaxedEnvironment: false,
    };
  }

  const byUseCase = current.filter((tool) =>
    tool.useCaseKinds.includes(answers.useCase!),
  );

  const goal = USE_CASE_LABEL[answers.useCase].toLowerCase();

  if (!answers.environment) {
    return {
      tools: byUseCase.slice(0, limit),
      explanation: `Tools whose documented purpose covers “${goal}”. Choose where you want to work to narrow this further.`,
      relaxedEnvironment: false,
    };
  }

  const byEnvironment = byUseCase.filter((tool) =>
    tool.environments.includes(answers.environment!),
  );

  const place = ENVIRONMENT_LABEL[answers.environment].toLowerCase();

  // Nothing matched both. Widening and saying so beats an empty result that
  // looks like a bug, and beats silently answering a question nobody asked.
  if (byEnvironment.length === 0) {
    return {
      tools: byUseCase.slice(0, limit),
      explanation: `Nothing in the catalog covers “${goal}” ${place}, so these are the tools for that job wherever they run.`,
      relaxedEnvironment: true,
    };
  }

  return {
    tools: byEnvironment.slice(0, limit),
    explanation: `Tools whose documented purpose covers “${goal}”, and that work ${place}.`,
    relaxedEnvironment: false,
  };
}

/**
 * Why a specific tool appeared in the results.
 *
 * Pulled from the tool's own authored note for that use case, so the reason a
 * learner reads is the one a human wrote about that pairing — not a sentence
 * assembled from the filter that happened to match.
 */
export function reasonFor(tool: AIToolListItem, useCase: AIUseCase | null): string | null {
  if (!useCase) return null;
  return tool.useCases.find((entry) => entry.useCase === useCase)?.note ?? null;
}
