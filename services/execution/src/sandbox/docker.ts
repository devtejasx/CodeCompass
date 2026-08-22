import { spawn } from "node:child_process";

import { config } from "../config.js";
import { log } from "../log.js";
import type { CaseResult, SandboxOutcome, Verdict } from "../types.js";
import type { Sandbox, SandboxRequest } from "./types.js";

/**
 * A throwaway container per submission.
 *
 * Every flag below is load-bearing, and the ones that look like belt and braces
 * are there because the alternatives fail differently:
 *
 *   --network none          No route out of the namespace at all. Not a
 *                           firewall rule and not a policy, so there is nothing
 *                           to misconfigure and nothing to bypass. This is what
 *                           makes Postgres, Redis, this service's own API and
 *                           the cloud metadata endpoint unreachable.
 *   --user 65534:65534      nobody. Never root, so an escape needs a privilege
 *                           escalation before it needs anything else.
 *   --cap-drop ALL          No capabilities, including the ones root keeps.
 *   no-new-privileges       A setuid binary cannot raise privileges, which is
 *                           what closes the "drop caps, then exec /bin/su" gap.
 *   --read-only             The image is immutable at run time. Nothing written
 *                           can persist or reach another run.
 *   --tmpfs /work           The one writable place, and sized - this is the
 *                           disk limit. nosuid and nodev so it cannot stage an
 *                           escalation; exec because a compiled language has to
 *                           run the binary it just built.
 *   --tmpfs /tmp            Small, and noexec: the JVM wants a scratch
 *                           directory, but nothing should run out of it.
 *   --pids-limit            A fork bomb meets a kernel refusal, not the host.
 *   --memory/--memory-swap  Equal, so swap is off and exceeding the limit is a
 *                           prompt OOM kill rather than the host thrashing.
 *   --cpus                  A quota, not a share. It holds under contention.
 *   --ulimit fsize          A program cannot fill even its own tmpfs quickly.
 *
 * The environment is built from nothing. Docker does not copy the daemon's
 * environment into a container, and every variable the sandbox has is listed
 * below - so DATABASE_URL, the Auth.js secret, the GitHub token and this
 * service's own EXECUTION_TOKEN are not merely hidden from a submission. They
 * were never in the process it runs in.
 *
 * What this does not claim: it is not a hypervisor. A kernel exploit reachable
 * from a seccomp-filtered, capability-free, non-root process would defeat it,
 * as it would defeat any container. docs/code-execution.md says so plainly
 * rather than describing this as escape-proof.
 */

/** Marks our containers, so an orphan sweep can find them without guessing. */
const LABEL = "codecompass.execution=1";

/**
 * What the in-container runner prints.
 *
 * Untrusted. The runner is ours, but it shares a uid with the program it
 * supervises, so every field is re-checked rather than assumed.
 */
interface RunnerReport {
  stage: "setup" | "compile" | "run";
  exit: number | null;
  signal: number | null;
  timedOut: boolean;
  outputLimit: boolean;
  durationMs: number;
  maxRssKb: number | null;
  oom: boolean;
  stderr: string;
  stdout: string;
  results: string[];
}

export class DockerSandbox implements Sandbox {
  readonly name = "docker";

  /**
   * Containers this process is currently supervising.
   *
   * The orphan sweep exists to remove containers whose supervisor died, and it
   * finds them by label. Every container it can see carries that label -
   * including the ones running right now - so without this set the sweep would
   * remove live executions and report them as infrastructure failures. It did,
   * on the first full run of the catalog: twenty-three submissions came back
   * SYSTEM_ERROR, all of them within half a second of a sweep tick.
   */
  private readonly live = new Set<string>();

  async run(request: SandboxRequest): Promise<SandboxOutcome> {
    const container = `cc-exec-${request.executionId}`;
    this.live.add(container);
    try {
      return await this.supervise(container, request);
    } finally {
      this.live.delete(container);
    }
  }

  private async supervise(
    container: string,
    request: SandboxRequest,
  ): Promise<SandboxOutcome> {
    const payload = JSON.stringify({
      files: request.program.files,
      compile: request.program.compile,
      run: request.program.run,
      wallClockMs: request.wallClockMs,
      compileTimeoutMs: request.compileTimeoutMs,
      outputLimitBytes: request.outputLimitBytes,
      resultLimitBytes: config.limits.maxResultBytes,
    });

    /*
     * The outer wall clock.
     *
     * The runner inside the container enforces the learner's time limit
     * precisely, and that is where a TIME_LIMIT verdict normally comes from.
     * But the runner runs as the same unprivileged user as the program it
     * supervises, so a determined submission can interfere with it. This
     * timeout is the answer to that, and it does not need the runner to be
     * trustworthy: removing the container ends every process inside it.
     */
    const outerMs = request.wallClockMs + request.compileTimeoutMs + 10_000;

    const started = Date.now();
    const attempt = await this.invoke(container, payload, request.memoryMb, outerMs);

    if (attempt.kind === "spawn-failed") {
      log.error("sandbox.unavailable", {
        executionId: request.executionId,
        container,
        reason: attempt.reason,
      });
      return fail("ENVIRONMENT_ERROR", null);
    }

    if (attempt.kind === "outer-timeout") {
      // The container is already being removed. This is only about what the
      // learner is told, and what they experienced is a program that did not
      // finish. Logged separately, because the in-container limit failing to
      // fire is a bug in the runner rather than in the solution.
      log.warn("sandbox.outer_timeout", {
        executionId: request.executionId,
        container,
        durationMs: Date.now() - started,
      });
      return fail("TIME_LIMIT", Date.now() - started);
    }

    const report = parseReport(attempt.stdout);
    if (!report) {
      log.error("sandbox.unreadable_report", {
        executionId: request.executionId,
        container,
        reason: attempt.stderr.slice(0, 400) || `docker exited ${attempt.code}`,
      });
      return fail("ENVIRONMENT_ERROR", null);
    }

    return interpret(report, request);
  }

  /** Runs one container to completion, or removes it trying. */
  private invoke(
    container: string,
    payload: string,
    memoryMb: number,
    outerMs: number,
  ): Promise<InvokeOutcome> {
    return new Promise((resolve) => {
      const child = spawn(config.dockerBin, dockerArgs(container, memoryMb), {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";
      let settled = false;
      // The runner's report is small and bounded by construction. Anything
      // larger means something in the container is writing to stdout that
      // should not be, and reading it forever would be the bug.
      const readCap = 8 * 1024 * 1024;

      const finish = (outcome: InvokeOutcome) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(outcome);
      };

      const timer = setTimeout(() => {
        // Removing the container is what actually stops the work: it takes the
        // whole process tree with it, whatever the program forked. Killing the
        // docker *client* would only detach us from a container still running.
        remove(container);
        child.kill("SIGKILL");
        finish({ kind: "outer-timeout" });
      }, outerMs);

      child.stdout.on("data", (chunk: Buffer) => {
        if (stdout.length < readCap) stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk: Buffer) => {
        if (stderr.length < 64 * 1024) stderr += chunk.toString("utf8");
      });

      child.on("error", (error) => {
        finish({ kind: "spawn-failed", reason: error.message });
      });
      child.on("close", (code) => {
        finish({ kind: "done", stdout, stderr, code });
      });

      // A container that exits before reading its payload gives us a broken
      // pipe. That is a report to interpret, not a crash to propagate.
      child.stdin.on("error", () => undefined);
      child.stdin.end(payload);
    });
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    // Asks the daemon whether the runner image exists. It runs nothing, which
    // is the requirement: "are we up?" must not cost a container, and must
    // never depend on executing something a caller supplied.
    const probe = await once(config.dockerBin, [
      "image",
      "inspect",
      "--format",
      "{{.Id}}",
      config.image,
    ]);

    if (probe.error) return { ok: false, detail: "container runtime unavailable" };
    if (probe.code === 0) return { ok: true, detail: "runner image present" };
    return { ok: false, detail: "runner image missing" };
  }

  async sweep(): Promise<number> {
    // By name rather than by id, because a name is what this process knows its
    // own live containers by. An id would have to be looked up per container,
    // and the window between listing and removing is exactly where a container
    // that started a moment ago would be killed mid-execution.
    const listed = await once(config.dockerBin, [
      "ps",
      "-a",
      "--format",
      "{{.Names}}",
      "--filter",
      `label=${LABEL}`,
    ]);
    if (listed.code !== 0) return 0;

    const orphans = listed.stdout
      .split(/\s+/)
      .filter(Boolean)
      .filter((name) => !this.live.has(name));
    if (orphans.length === 0) return 0;

    await once(config.dockerBin, ["rm", "-f", ...orphans]);
    return orphans.length;
  }
}

type InvokeOutcome =
  | { kind: "done"; stdout: string; stderr: string; code: number | null }
  | { kind: "outer-timeout" }
  | { kind: "spawn-failed"; reason: string };

function dockerArgs(container: string, memoryMb: number): string[] {
  const memory = `${memoryMb}m`;
  const limits = config.limits;

  const args = [
    "run",
    // Removed on exit, every exit. The sweep is for the other case: this
    // process dying before docker does.
    "--rm",
    "-i",
    "--name",
    container,
    "--label",
    LABEL,

    // ── Isolation ──────────────────────────────────────────────────────────
    "--network",
    "none",
    "--user",
    "65534:65534",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",

    // ── Filesystem ─────────────────────────────────────────────────────────
    "--tmpfs",
    `/work:rw,exec,nosuid,nodev,size=${limits.workTmpfsMb}m,mode=1777`,
    "--tmpfs",
    `/tmp:rw,noexec,nosuid,nodev,size=${limits.tmpTmpfsMb}m,mode=1777`,
    "--workdir",
    "/work",

    // ── Resources ──────────────────────────────────────────────────────────
    "--pids-limit",
    String(limits.pids),
    "--memory",
    memory,
    "--memory-swap",
    memory,
    "--cpus",
    String(limits.cpus),
    "--ulimit",
    `nofile=${limits.openFiles}:${limits.openFiles}`,
    "--ulimit",
    `fsize=${limits.maxFileBytes}:${limits.maxFileBytes}`,
    "--ulimit",
    "core=0:0",

    // ── Environment ────────────────────────────────────────────────────────
    // Everything the sandbox has. PATH comes from the image; nothing else is
    // inherited, because docker builds a container's environment rather than
    // copying the daemon's.
    "--env",
    "HOME=/work",
    "--env",
    "TZ=UTC",
    "--env",
    "LANG=C.UTF-8",
    "--env",
    "LC_ALL=C.UTF-8",
    // Determinism: Python seeds set and dict iteration per process unless told
    // not to, so without this the same submission could pass and then fail.
    "--env",
    "PYTHONHASHSEED=0",
    "--env",
    "PYTHONDONTWRITEBYTECODE=1",
  ];

  if (config.seccompProfile) {
    args.push("--security-opt", `seccomp=${config.seccompProfile}`);
  }

  // The entrypoint is the runner, not a shell, and the runner is baked into the
  // image at a path the sandbox cannot write to.
  args.push("--entrypoint", "/usr/bin/python3", config.image, "/opt/cc/runner.py");

  return args;
}

/** Best-effort removal. A container that is already gone counts as removed. */
function remove(container: string): void {
  const child = spawn(config.dockerBin, ["rm", "-f", container], {
    stdio: "ignore",
    windowsHide: true,
  });
  child.on("error", () => undefined);
}

function parseReport(stdout: string): RunnerReport | null {
  // The runner prints exactly one JSON object, and prints it last. Anything
  // before it came from something else in the container and is discarded
  // rather than trusted.
  const line = stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  if (!line) return null;

  try {
    const parsed = JSON.parse(line) as Record<string, unknown>;
    const stage = parsed.stage;
    if (stage !== "setup" && stage !== "compile" && stage !== "run") return null;

    return {
      stage,
      exit: typeof parsed.exit === "number" ? parsed.exit : null,
      signal: typeof parsed.signal === "number" ? parsed.signal : null,
      timedOut: parsed.timedOut === true,
      outputLimit: parsed.outputLimit === true,
      durationMs: typeof parsed.durationMs === "number" ? parsed.durationMs : 0,
      maxRssKb: typeof parsed.maxRssKb === "number" ? parsed.maxRssKb : null,
      oom: parsed.oom === true,
      stderr: typeof parsed.stderr === "string" ? parsed.stderr : "",
      stdout: typeof parsed.stdout === "string" ? parsed.stdout : "",
      results: Array.isArray(parsed.results)
        ? parsed.results.filter((entry): entry is string => typeof entry === "string")
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Runner report to verdict.
 *
 * The order of these checks is the whole of the mapping, and it is ordered by
 * certainty: what we *know* happened comes before what we infer from a signal.
 * The other way round is how a timeout gets reported as a memory limit, since
 * both end in SIGKILL.
 */
function interpret(report: RunnerReport, request: SandboxRequest): SandboxOutcome {
  const results = parseResults(report.results);
  const message = report.stderr || report.stdout || null;

  if (report.stage === "setup") {
    // The runner could not even write the files. Ours to fix, not theirs.
    return fail("ENVIRONMENT_ERROR", null);
  }

  if (report.stage === "compile") {
    return {
      verdict: "COMPILE_ERROR",
      results: [],
      durationMs: null,
      memoryKb: null,
      message: report.timedOut
        ? "The compiler was still running after the time it is allowed."
        : message,
    };
  }

  // ── The program ran ────────────────────────────────────────────────────────

  const measured = { durationMs: report.durationMs, memoryKb: report.maxRssKb };

  if (report.outputLimit) {
    return { verdict: "OUTPUT_LIMIT", results, ...measured, message: null };
  }
  if (report.timedOut) {
    return { verdict: "TIME_LIMIT", results, ...measured, message: null };
  }
  if (report.oom || looksLikeMemory(report.stderr, request)) {
    return { verdict: "MEMORY_LIMIT", results, ...measured, message: null };
  }
  if (report.exit === 0) {
    return { verdict: "ACCEPTED", results, ...measured, message: null };
  }
  // 70 is EX_SOFTWARE, which only our own harness returns, and only when it
  // could not open the results file. That is our problem, not the learner's.
  if (report.exit === 70 && results.length === 0) {
    return fail("ENVIRONMENT_ERROR", null);
  }
  if (looksLikeProcessLimit(report.stderr)) {
    return { verdict: "PROCESS_LIMIT", results, ...measured, message };
  }
  // SIGKILL with nothing else to explain it, once the timeout and the output
  // bomb are ruled out above, is the kernel's out-of-memory killer.
  if (report.signal === 9) {
    return { verdict: "MEMORY_LIMIT", results, ...measured, message: null };
  }

  return { verdict: "RUNTIME_ERROR", results, ...measured, message };
}

/**
 * Runtimes that hit their own ceiling before the container's.
 *
 * The JVM raises OutOfMemoryError and exits normally; V8 aborts with a message;
 * Python raises MemoryError; a C++ allocation throws std::bad_alloc. All four
 * are the memory limit doing its job, and reporting them as runtime errors
 * would send the learner looking for a bug that is not there.
 */
function looksLikeMemory(stderr: string, request: SandboxRequest): boolean {
  if (!stderr) return false;
  switch (request.language) {
    case "JAVA":
      return stderr.includes("OutOfMemoryError");
    case "JAVASCRIPT":
    case "TYPESCRIPT":
      return (
        stderr.includes("JavaScript heap out of memory") ||
        stderr.includes("Allocation failed")
      );
    case "PYTHON":
      return stderr.includes("MemoryError");
    case "CPP":
      return stderr.includes("std::bad_alloc");
  }
}

/** A fork bomb meeting --pids-limit, in each runtime's words for it. */
function looksLikeProcessLimit(stderr: string): boolean {
  if (!stderr) return false;
  return (
    stderr.includes("Resource temporarily unavailable") ||
    stderr.includes("BlockingIOError") ||
    stderr.includes("unable to create native thread") ||
    stderr.includes("Cannot allocate memory") ||
    stderr.includes("fork failed")
  );
}

function parseResults(lines: string[]): CaseResult[] {
  const results: CaseResult[] = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as { i?: unknown; v?: unknown };
      if (typeof parsed.i !== "number" || !Number.isInteger(parsed.i)) continue;
      if (!("v" in parsed)) continue;
      results.push({ index: parsed.i, value: JSON.stringify(parsed.v ?? null) });
    } catch {
      // A line the harness did not write. Skipped rather than trusted: a
      // missing result fails its case, which is the safe direction to be wrong.
    }
  }
  return results;
}

function fail(verdict: Verdict, durationMs: number | null): SandboxOutcome {
  return { verdict, results: [], durationMs, memoryKb: null, message: null };
}

/** Runs a short docker subcommand and collects its output. */
function once(
  bin: string,
  args: string[],
): Promise<{ code: number | null; stdout: string; error: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(bin, args, {
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });
    let stdout = "";
    let settled = false;
    const finish = (outcome: {
      code: number | null;
      stdout: string;
      error: boolean;
    }) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };
    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < 64 * 1024) stdout += chunk.toString("utf8");
    });
    child.on("error", () => finish({ code: null, stdout: "", error: true }));
    child.on("close", (code) => finish({ code, stdout, error: false }));
  });
}
