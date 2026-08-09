import type { CodeLanguage } from "@/generated/prisma/client";

import { HttpExecutionService } from "./http-provider";
import { MockExecutionService } from "./mock-provider";
import type { CodeExecutionService, ExecutionRequest, ExecutionResult } from "./types";

export * from "./types";
export { normaliseSource } from "./mock-provider";
export { sanitiseMessage, sanitiseOutput } from "./sanitise";

/**
 * Provider selection.
 *
 * The default is deliberately the *unavailable* provider, not the mock. An
 * application that is misconfigured in production must say "execution is
 * unavailable" rather than quietly hand out simulated verdicts that look real.
 * The mock has to be asked for by name, and asking for it in production is
 * refused.
 *
 *   CODE_EXECUTION_PROVIDER = http | mock | none
 *   CODE_EXECUTION_URL      = https://…            (http only, required)
 *   CODE_EXECUTION_TOKEN    = …                    (http only, recommended)
 *   CODE_EXECUTION_LANGUAGES= PYTHON,JAVASCRIPT    (http only, optional)
 */

/** Nothing runs. Every submission comes back as a service error, honestly. */
class UnavailableExecutionService implements CodeExecutionService {
  readonly name = "none";
  readonly simulated = false;

  supportedLanguages(): readonly CodeLanguage[] {
    // Nothing can run, so nothing is advertised. The problem page reads this
    // and disables Run and Submit rather than offering a button that lies.
    return [];
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    return {
      status: "SYSTEM_ERROR",
      passedTests: 0,
      totalTests: request.tests.length,
      executionTime: null,
      memoryUsed: null,
      message: null,
      outcomes: request.tests.map((test) => ({
        order: test.order,
        passed: false,
        actualOutput: null,
        isHidden: test.isHidden,
      })),
      simulated: false,
    };
  }
}

let cached: CodeExecutionService | undefined;

function build(): CodeExecutionService {
  const requested = (process.env.CODE_EXECUTION_PROVIDER ?? "none").toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (requested === "http") {
    const url = process.env.CODE_EXECUTION_URL?.trim();
    if (!url) {
      console.error(
        "[execution] CODE_EXECUTION_PROVIDER=http but CODE_EXECUTION_URL is unset.",
      );
      return new UnavailableExecutionService();
    }
    return new HttpExecutionService(url, process.env.CODE_EXECUTION_TOKEN?.trim());
  }

  if (requested === "mock") {
    if (isProduction) {
      // Simulated verdicts in front of real learners is not a trade-off worth
      // offering, so this is a refusal rather than a warning.
      console.error(
        "[execution] the mock provider is refused in production. " +
          "Configure CODE_EXECUTION_PROVIDER=http with a sandboxed service.",
      );
      return new UnavailableExecutionService();
    }
    return new MockExecutionService();
  }

  return new UnavailableExecutionService();
}

/** The configured execution service. Resolved once per process. */
export function getExecutionService(): CodeExecutionService {
  cached ??= build();
  return cached;
}

/** Test seam — lets a suite swap the provider without reaching into module state. */
export function __setExecutionServiceForTests(
  service: CodeExecutionService | undefined,
): void {
  cached = service;
}

export { MockExecutionService, HttpExecutionService, UnavailableExecutionService };
