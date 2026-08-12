import { estimateTokens, type AIProvider, type AIRequest, type AIResponse } from "./types";

/**
 * The development provider.
 *
 * Returns a deterministic, clearly-labelled reply without calling anything.
 * Its purpose is to let the mentor's grounding, limits, storage, error paths
 * and UI be exercised — including in the test suite — on a machine with no API
 * key and no network.
 *
 * It is refused in production by the factory in ./provider. A simulated answer
 * that a learner could mistake for real guidance would be worse than no mentor
 * at all, so the reply says what it is in its first line.
 */
export class MockProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "mock-development";

  async generate(request: AIRequest): Promise<AIResponse> {
    const latest = request.messages[request.messages.length - 1];
    const question = latest?.content.trim() ?? "";

    // Echoes back a fact from the grounded context so tests can assert that
    // learner state actually reached the provider, and so a developer can see
    // at a glance whether grounding is wired up.
    const currentTopic = request.system.match(/Current topic: (.+)/)?.[1] ?? null;

    const text = [
      "**Simulated response** — no *real* AI provider is configured on this deployment, so CodeCompass is using the simulated provider. This is a placeholder rather than real guidance.",
      "",
      currentTopic
        ? `Your roadmap says you are on **${currentTopic}**. Continuing there is your next step.`
        : "Your roadmap is the source of truth for what comes next — the dashboard's next step is calculated from your actual progress, not from AI.",
      "",
      question
        ? `You asked: "${truncate(question, 160)}"`
        : "Ask a question to see how the mentor works.",
      "",
      "Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` to enable real guidance.",
    ].join("\n");

    return {
      text,
      inputTokens: estimateTokens(request.system + question),
      outputTokens: estimateTokens(text),
      provider: this.name,
      model: this.model,
    };
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
