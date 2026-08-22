import "dotenv/config";

import { getExecutionService } from "../src/lib/practice/execution";

/**
 * Asks the configured execution provider whether it could grade something.
 *
 *   npm run exec:health
 *
 * For a deployment check, a smoke test after a release, or the five seconds
 * before concluding that Practice is broken. It runs no code - the provider's
 * health check is a question, not a submission - so it is safe to point at
 * production and safe to run on a schedule.
 *
 * Exits 0 when the provider is available and 1 when it is not, so it can be the
 * command in a health probe rather than something a person has to read.
 */
async function main(): Promise<void> {
  const service = getExecutionService();
  const health = await service.health();

  const lines = [
    `provider   ${service.name}`,
    `simulated  ${service.simulated ? "yes - verdicts are not real" : "no"}`,
    `languages  ${service.supportedLanguages().join(", ") || "(none)"}`,
    `available  ${health.available ? "yes" : "no"}`,
    `detail     ${health.detail}`,
  ];

  console.log(lines.join("\n"));
  process.exit(health.available ? 0 : 1);
}

void main();
