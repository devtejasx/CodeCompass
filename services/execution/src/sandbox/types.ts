import type { Language, SandboxOutcome } from "../types.js";
import type { SandboxProgram } from "../harness/index.js";

/**
 * The sandbox boundary.
 *
 * Above this interface the service knows about problems, test cases and
 * verdicts. Below it, there is a program and a set of limits, and the only
 * contract is that the program runs somewhere that cannot reach anything.
 *
 * It is an interface for the same reason CodeExecutionService is one in the
 * application: the isolation technology is an implementation detail that will
 * be replaced. Today it is a throwaway container per submission. A gVisor
 * runtime, a Firecracker micro-VM or a hosted judge would all be a new file
 * here and no change anywhere else.
 */

export interface SandboxRequest {
  executionId: string;
  language: Language;
  program: SandboxProgram;
  /** Wall clock the learner's program gets, after which it is killed. */
  wallClockMs: number;
  /** Wall clock the compiler gets. Never charged against the learner. */
  compileTimeoutMs: number;
  /** Memory the container gets, including the runtime's own floor. */
  memoryMb: number;
  /** Combined stdout and stderr the program may produce before it is stopped. */
  outputLimitBytes: number;
}

export interface Sandbox {
  /** Short identifier, for logs and the health check. */
  readonly name: string;
  run(request: SandboxRequest): Promise<SandboxOutcome>;
  /**
   * Whether the sandbox could run something right now. Must not execute
   * anything a caller supplied - the whole point is to answer "are we up?"
   * without taking a submission to find out.
   */
  health(): Promise<{ ok: boolean; detail: string }>;
  /** Removes execution containers left behind by a supervisor that died. */
  sweep(): Promise<number>;
}
