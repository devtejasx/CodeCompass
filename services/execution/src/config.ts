import type { Language } from "./types.js";

/**
 * Everything the service is allowed to do, in numbers.
 *
 * Two rules govern this file.
 *
 *   Every limit has a value here, and none of them is optional. A limit that
 *   defaults to "unset" is a limit that is off in production the first time
 *   somebody forgets an environment variable, and the whole point of a sandbox
 *   is that its ceilings hold when nobody is looking.
 *
 *   A limit the *request* asks for is a request, not an instruction. The
 *   application already clamps timeLimitMs and memoryLimitMb before sending
 *   them; this service clamps them again, because "the caller checked" is not
 *   a security control when the caller is across a network.
 */

function int(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export const config = {
  port: int("PORT", 8080, 1, 65_535),
  /** Shared secret the application presents. Unset means the service refuses everything. */
  token: process.env.EXECUTION_TOKEN?.trim() ?? "",
  /** The sandbox image. Must be built from ./runner and must not contain secrets. */
  image: process.env.EXECUTION_IMAGE?.trim() || "codecompass-runner:1",
  /** `docker`, or a drop-in that speaks the same CLI (podman). */
  dockerBin: process.env.EXECUTION_DOCKER_BIN?.trim() || "docker",
  /**
   * An optional seccomp profile path, handed to the container runtime.
   *
   * Unset means Docker's default profile, which already refuses mount, kexec,
   * the module calls and most of the rest of the attack surface. A deployment
   * that wants to narrow it further points this at its own profile rather than
   * this service growing an opinion about syscalls.
   */
  seccompProfile: process.env.EXECUTION_SECCOMP_PROFILE?.trim() ?? "",

  /**
   * How many sandboxes may exist at once.
   *
   * This is the whole of the service's capacity story: each one is a container
   * with a CPU quota, so the ceiling is roughly (cores / cpuQuota). Anything
   * over it queues; anything over the queue ceiling is refused with 429 rather
   * than accepted and left to time out, because a caller that is told "busy"
   * can retry and a caller that is left hanging cannot.
   */
  maxConcurrent: int("EXECUTION_MAX_CONCURRENT", 4, 1, 64),
  maxQueued: int("EXECUTION_MAX_QUEUED", 32, 0, 1024),
  /** Longest a request may sit in the queue before it is refused. */
  queueWaitMs: int("EXECUTION_QUEUE_WAIT_MS", 10_000, 500, 60_000),

  limits: {
    /** Longest source the service will look at. Matches the application's ceiling. */
    maxCodeBytes: int("EXECUTION_MAX_CODE_BYTES", 64 * 1024, 1024, 1024 * 1024),
    /** Most graded cases in one request. The catalog's largest problem has nine. */
    maxTests: int("EXECUTION_MAX_TESTS", 64, 1, 256),
    /** Largest single test input or expected output. */
    maxTestBytes: int("EXECUTION_MAX_TEST_BYTES", 64 * 1024, 256, 1024 * 1024),

    /** Per-case wall clock the request may ask for. */
    maxTimeLimitMs: int("EXECUTION_MAX_TIME_LIMIT_MS", 10_000, 100, 60_000),
    /** Per-run memory the request may ask for, before the language's overhead. */
    maxMemoryLimitMb: int("EXECUTION_MAX_MEMORY_MB", 512, 16, 4096),

    /** Combined stdout + stderr the program may produce before it is stopped. */
    maxOutputBytes: int(
      "EXECUTION_MAX_OUTPUT_BYTES",
      256 * 1024,
      1024,
      8 * 1024 * 1024,
    ),
    /** Size ceiling on the file the harness writes its return values to. */
    maxResultBytes: int(
      "EXECUTION_MAX_RESULT_BYTES",
      512 * 1024,
      1024,
      8 * 1024 * 1024,
    ),

    /** Processes and threads inside the sandbox. Stops a fork bomb at the kernel. */
    pids: int("EXECUTION_PIDS_LIMIT", 96, 8, 1024),
    /** Fraction of one core. A quota, not a share: it holds under contention. */
    cpus: Number(process.env.EXECUTION_CPUS ?? "1.0") || 1.0,
    /** Size of the sandbox's only writable filesystem. This is the disk limit. */
    workTmpfsMb: int("EXECUTION_WORK_TMPFS_MB", 64, 8, 1024),
    tmpTmpfsMb: int("EXECUTION_TMP_TMPFS_MB", 16, 4, 256),
    /** Open file descriptors, and the largest file the program may create. */
    openFiles: int("EXECUTION_OPEN_FILES", 256, 32, 4096),
    maxFileBytes: int(
      "EXECUTION_MAX_FILE_BYTES",
      32 * 1024 * 1024,
      1024 * 1024,
      256 * 1024 * 1024,
    ),

    /** How long a compiler gets. Not charged against the learner's time limit. */
    compileTimeoutMs: int("EXECUTION_COMPILE_TIMEOUT_MS", 20_000, 1_000, 120_000),
  },
} as const;

/**
 * How much memory each runtime needs *before* it runs a line of the learner's
 * code, and how long it takes to get there.
 *
 * These are not padding for the sake of it. A JVM with `--memory=128m` does not
 * run a slow program, it fails to start, and reporting that as "your solution
 * used too much memory" would be a lie told to every Java learner. So the
 * container is given the problem's limit *plus* the runtime's floor, the
 * runtime is told to cap its own heap at the problem's limit, and the verdict
 * comes from the runtime hitting that cap rather than from the container dying.
 *
 * The grace is the same argument for time: `java` needs most of a second to
 * reach main(), and charging that to a two-second limit would fail correct
 * solutions on the slowest two languages only.
 */
export const RUNTIME_OVERHEAD: Record<Language, { memoryMb: number; graceMs: number }> =
  {
    JAVASCRIPT: { memoryMb: 96, graceMs: 400 },
    TYPESCRIPT: { memoryMb: 96, graceMs: 400 },
    PYTHON: { memoryMb: 48, graceMs: 300 },
    JAVA: { memoryMb: 256, graceMs: 1_200 },
    CPP: { memoryMb: 16, graceMs: 100 },
  };

/**
 * The wall clock a whole batch gets.
 *
 * `timeLimitMs` is authored per *problem* and means "how long one run of this
 * program may take" - it is the number the problem page shows and the number
 * the time-limit feedback quotes. A batch runs every case in one process, so
 * the batch gets the per-case limit times the number of cases, plus one
 * runtime start-up.
 *
 * Doing it the other way - one limit for the whole batch - would mean a problem
 * with nine cases silently had a ninth of the time limit it advertises.
 */
export function wallClockMs(
  language: Language,
  timeLimitMs: number,
  testCount: number,
): number {
  const grace = RUNTIME_OVERHEAD[language].graceMs;
  return timeLimitMs * Math.max(testCount, 1) + grace;
}

/** Container memory: what the problem allows, plus what the runtime costs to start. */
export function containerMemoryMb(language: Language, memoryLimitMb: number): number {
  return memoryLimitMb + RUNTIME_OVERHEAD[language].memoryMb;
}
