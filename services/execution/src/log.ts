/**
 * Structured logging.
 *
 * One JSON object per line, because the thing reading it is a log aggregator
 * and not a person. What is *not* here matters more than what is: this service
 * never logs the submitted source, never logs a test case's input or expected
 * output, and never logs the bearer token. An execution is described by its
 * shape - which language, which verdict, how long, how much - and by an opaque
 * id that ties it to the application's submission row.
 *
 * Source code is deliberately excluded rather than truncated. A learner's
 * solution is their work; an attacker's payload is evidence, and evidence that
 * sits in a log aggregator for ninety days is a liability. If a payload ever
 * needs keeping, that is a deliberate capture with a retention policy, not a
 * side effect of ordinary logging.
 */

type Level = "info" | "warn" | "error";

export interface ExecutionLogFields {
  /**
   * Ties a line to the application's submission. Required on every event, so
   * that a verdict, its queue wait and the container that produced it can be
   * read as one story rather than three unrelated lines.
   */
  executionId: string;
  /** Anything else worth recording. Never source code, never a test case. */
  [key: string]: unknown;
  language?: string;
  entryPoint?: string;
  tests?: number;
  verdict?: string;
  status?: string;
  durationMs?: number;
  queuedMs?: number;
  memoryKb?: number | null;
  passed?: number;
  container?: string;
  reason?: string;
}

function write(level: Level, event: string, fields: ExecutionLogFields): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

export const log = {
  info: (event: string, fields: ExecutionLogFields) => write("info", event, fields),
  warn: (event: string, fields: ExecutionLogFields) => write("warn", event, fields),
  error: (event: string, fields: ExecutionLogFields) => write("error", event, fields),
};

/**
 * An id for one execution.
 *
 * Random rather than sequential: it appears in a container name, and a
 * container name is visible to anyone who can list containers on the host. A
 * counter would tell them how much traffic the service has taken.
 */
export function executionId(): string {
  return `x${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`;
}
