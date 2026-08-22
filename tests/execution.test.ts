import { describe, expect, it, vi } from "vitest";

import { validateExecuteRequest } from "../services/execution/src/validate";
import { narrow, type ExecuteRequest } from "../services/execution/src/types";
import { equalValues, matches } from "../services/execution/src/compare";
import { buildProgram, runtimeFor } from "../services/execution/src/harness/index";
import { cppLiteral } from "../services/execution/src/harness/cpp";
import { ExecutionQueue, QueueFull } from "../services/execution/src/queue";
import { scrub } from "../services/execution/src/scrub";
import { containerMemoryMb, wallClockMs } from "../services/execution/src/config";
import { execute } from "../services/execution/src/execute";
import type { Sandbox, SandboxRequest } from "../services/execution/src/sandbox/types";
import type { SandboxOutcome, Verdict } from "../services/execution/src/types";

/**
 * The execution layer, without a container in sight.
 *
 * Everything here runs in CI, on a machine with no Docker, because every part
 * of grading that can be tested without executing code *is* tested without
 * executing code. The sandbox is replaced at its own interface - which is the
 * same seam the service uses to swap container technology - so the harness
 * generator, the verdict mapping, the comparison rules, the queue and the
 * request validation are all exercised as themselves.
 *
 * What is deliberately *not* here: proof that a fork bomb dies, that the
 * network is unreachable, or that /etc/passwd is out of reach. Those cannot be
 * asserted without a real sandbox and are not going to be faked into looking
 * asserted. They live in tests/execution-sandbox.test.ts, which skips itself
 * unless it is pointed at a running service.
 */

// ── A sandbox that runs nothing ────────────────────────────────────────────

function fakeSandbox(outcome: Partial<SandboxOutcome> & { verdict: Verdict }): {
  sandbox: Sandbox;
  seen: SandboxRequest[];
} {
  const seen: SandboxRequest[] = [];
  const sandbox: Sandbox = {
    name: "fake",
    async run(request) {
      seen.push(request);
      return {
        results: [],
        durationMs: 5,
        memoryKb: 1024,
        message: null,
        ...outcome,
      };
    },
    async health() {
      return { ok: true, detail: "fake" };
    },
    async sweep() {
      return 0;
    },
  };
  return { sandbox, seen };
}

function request(overrides: Partial<ExecuteRequest> = {}): ExecuteRequest {
  return {
    language: "PYTHON",
    code: "def solve(n):\n    return n + 1\n",
    entryPoint: "solve",
    tests: [
      { order: 1, input: "[1]", expectedOutput: "2" },
      { order: 2, input: "[5]", expectedOutput: "6" },
    ],
    timeLimitMs: 2000,
    memoryLimitMb: 128,
    ...overrides,
  };
}

// ── Request validation ─────────────────────────────────────────────────────

describe("execution request validation", () => {
  it("accepts a well-formed request", () => {
    const result = validateExecuteRequest(request());
    expect(result.ok).toBe(true);
  });

  it("refuses a language it cannot run", () => {
    const result = validateExecuteRequest({ ...request(), language: "RUBY" });
    expect(result).toMatchObject({ ok: false });
  });

  it("refuses an entry point that is not a plain identifier", () => {
    // The entry point is interpolated into generated source in five languages.
    // If anything can turn harness generation into code injection, it is this
    // field, so the shape is checked rather than the characters escaped.
    for (const entryPoint of [
      "solve; system('rm -rf /')",
      "solve()",
      "1solve",
      "sol ve",
      "sol-ve",
      "",
    ]) {
      expect(validateExecuteRequest({ ...request(), entryPoint })).toMatchObject({
        ok: false,
      });
    }
  });

  it("refuses source larger than the limit", () => {
    const result = validateExecuteRequest({
      ...request(),
      code: "x".repeat(64 * 1024 + 1),
    });
    expect(result).toMatchObject({ ok: false });
  });

  it("refuses a test input that is not a JSON array of arguments", () => {
    const notJson = validateExecuteRequest({
      ...request(),
      tests: [{ order: 1, input: "not json", expectedOutput: "1" }],
    });
    const notArray = validateExecuteRequest({
      ...request(),
      tests: [{ order: 1, input: "{}", expectedOutput: "1" }],
    });
    expect(notJson).toMatchObject({ ok: false });
    expect(notArray).toMatchObject({ ok: false });
  });

  it("refuses two tests that share an order", () => {
    // The application keys outcomes by order. Two cases sharing one would make
    // a response ambiguous, and the ambiguity would silently drop a result.
    const result = validateExecuteRequest({
      ...request(),
      tests: [
        { order: 1, input: "[1]", expectedOutput: "2" },
        { order: 1, input: "[2]", expectedOutput: "3" },
      ],
    });
    expect(result).toMatchObject({ ok: false });
  });

  it("clamps a request that asks for more time or memory than the ceiling", () => {
    const result = validateExecuteRequest({
      ...request(),
      timeLimitMs: 900_000,
      memoryLimitMb: 64_000,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.timeLimitMs).toBeLessThanOrEqual(10_000);
    expect(result.request.memoryLimitMb).toBeLessThanOrEqual(512);
  });
});

// ── Verdict mapping ────────────────────────────────────────────────────────

describe("verdict mapping", () => {
  it("keeps the verdicts the application can store", () => {
    expect(narrow("ACCEPTED")).toBe("ACCEPTED");
    expect(narrow("WRONG_ANSWER")).toBe("WRONG_ANSWER");
    expect(narrow("TIME_LIMIT")).toBe("TIME_LIMIT");
    expect(narrow("MEMORY_LIMIT")).toBe("MEMORY_LIMIT");
    expect(narrow("OUTPUT_LIMIT")).toBe("OUTPUT_LIMIT");
    expect(narrow("COMPILE_ERROR")).toBe("COMPILE_ERROR");
    expect(narrow("RUNTIME_ERROR")).toBe("RUNTIME_ERROR");
  });

  it("reports a contained process bomb as the learner's runtime error", () => {
    // Their program asked for a thread it could not have and died. That is a
    // runtime error from where they are sitting, and the distinction the
    // service keeps internally is for the log, not for them.
    expect(narrow("PROCESS_LIMIT")).toBe("RUNTIME_ERROR");
  });

  it("reports our own failures as a system error, never as their mistake", () => {
    expect(narrow("ENVIRONMENT_ERROR")).toBe("SYSTEM_ERROR");
    expect(narrow("INTERNAL_ERROR")).toBe("SYSTEM_ERROR");
  });
});

// ── Grading ────────────────────────────────────────────────────────────────

describe("grading a sandbox outcome", () => {
  it("accepts a clean run whose every answer is right", async () => {
    const { sandbox } = fakeSandbox({
      verdict: "ACCEPTED",
      results: [
        { index: 0, value: "2" },
        { index: 1, value: "6" },
      ],
    });

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("ACCEPTED");
    expect(response.outcomes.every((outcome) => outcome.passed)).toBe(true);
    expect(response.outcomes.map((outcome) => outcome.order)).toEqual([1, 2]);
  });

  it("turns a clean run with a wrong answer into WRONG_ANSWER", async () => {
    // Exiting zero only means the harness got through every case. Whether the
    // answers are right is decided here, against values that never left us.
    const { sandbox } = fakeSandbox({
      verdict: "ACCEPTED",
      results: [
        { index: 0, value: "2" },
        { index: 1, value: "99" },
      ],
    });

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("WRONG_ANSWER");
    expect(response.outcomes[0].passed).toBe(true);
    expect(response.outcomes[1].passed).toBe(false);
    expect(response.outcomes[1].actualOutput).toBe("99");
  });

  it("fails a case the sandbox said nothing about", async () => {
    // A program that stopped after the first case did not answer the second,
    // and not answering is never passing.
    const { sandbox } = fakeSandbox({
      verdict: "RUNTIME_ERROR",
      results: [{ index: 0, value: "2" }],
      message: "IndexError: list index out of range",
    });

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("RUNTIME_ERROR");
    expect(response.outcomes[0].passed).toBe(true);
    expect(response.outcomes[1].passed).toBe(false);
    expect(response.outcomes[1].actualOutput).toBeNull();
  });

  it("cannot be told about a test that was not asked about", async () => {
    // Outcomes are built from our list, in our order. A sandbox that invents
    // cases cannot change how many tests a submission is graded on.
    const { sandbox } = fakeSandbox({
      verdict: "ACCEPTED",
      results: [
        { index: 0, value: "2" },
        { index: 1, value: "6" },
        { index: 2, value: "0" },
        { index: 99, value: "0" },
      ],
    });

    const { response } = await execute(sandbox, request());

    expect(response.outcomes).toHaveLength(2);
  });

  it("keeps the verdict when a run ended for a reason other than a wrong answer", async () => {
    // A submission that timed out on the last case has correct answers behind
    // it. Calling that a wrong answer would send the learner looking for a
    // logic bug instead of a slow loop.
    const { sandbox } = fakeSandbox({
      verdict: "TIME_LIMIT",
      results: [{ index: 0, value: "2" }],
    });

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("TIME_LIMIT");
    expect(response.outcomes[0].passed).toBe(true);
  });

  it("says nothing extra about a wrong answer", async () => {
    // Whatever the program printed is the learner's own debugging output.
    // Echoing it back as though it were a diagnostic is confusing, not helpful.
    const { sandbox } = fakeSandbox({
      verdict: "ACCEPTED",
      results: [
        { index: 0, value: "0" },
        { index: 1, value: "0" },
      ],
      message: "checking n=1",
    });

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("WRONG_ANSWER");
    expect(response.message).toBeNull();
  });

  it("treats a sandbox that threw as our failure, not theirs", async () => {
    const sandbox: Sandbox = {
      name: "broken",
      async run() {
        throw new Error("the daemon went away");
      },
      async health() {
        return { ok: false, detail: "down" };
      },
      async sweep() {
        return 0;
      },
    };

    const { response } = await execute(sandbox, request());

    expect(response.status).toBe("SYSTEM_ERROR");
    expect(response.outcomes.every((outcome) => !outcome.passed)).toBe(true);
    expect(response.outcomes.every((outcome) => outcome.actualOutput === null)).toBe(
      true,
    );
    // Nothing about the daemon reaches the caller.
    expect(JSON.stringify(response)).not.toContain("daemon");
  });
});

// ── Limits ─────────────────────────────────────────────────────────────────

describe("resource limits", () => {
  it("gives a batch the per-case limit for every case it holds", () => {
    // timeLimitMs is authored per problem and means one run of the program.
    // A batch of nine cases running in one process must not silently get a
    // ninth of the limit the problem page advertises.
    const one = wallClockMs("PYTHON", 2000, 1);
    const nine = wallClockMs("PYTHON", 2000, 9);
    expect(nine - one).toBe(2000 * 8);
  });

  it("gives the slower runtimes room to start", () => {
    expect(wallClockMs("JAVA", 2000, 1)).toBeGreaterThan(wallClockMs("CPP", 2000, 1));
  });

  it("adds the runtime's own floor to the container's memory", () => {
    // A JVM told to live in 128MB does not run a slow program, it fails to
    // start - and reporting that as "your solution used too much memory" would
    // be a lie told to every Java learner.
    expect(containerMemoryMb("JAVA", 128)).toBeGreaterThan(128);
    expect(containerMemoryMb("CPP", 128)).toBeLessThan(containerMemoryMb("JAVA", 128));
  });

  it("hands the sandbox the limits the request actually asked for", async () => {
    const { sandbox, seen } = fakeSandbox({ verdict: "ACCEPTED" });
    await execute(sandbox, request({ timeLimitMs: 3000, memoryLimitMb: 256 }));

    expect(seen).toHaveLength(1);
    expect(seen[0].wallClockMs).toBe(wallClockMs("PYTHON", 3000, 2));
    expect(seen[0].memoryMb).toBe(containerMemoryMb("PYTHON", 256));
    expect(seen[0].outputLimitBytes).toBeGreaterThan(0);
  });
});

// ── Comparison ─────────────────────────────────────────────────────────────

describe("answer comparison", () => {
  it("compares integers exactly", () => {
    expect(equalValues(3, 3)).toBe(true);
    expect(equalValues(3, 4)).toBe(false);
    // No tolerance for whole numbers: a count that is off by one is wrong.
    expect(equalValues(1000000, 1000001)).toBe(false);
  });

  it("allows a tolerance once either side is not a whole number", () => {
    expect(equalValues(0.1 + 0.2, 0.3)).toBe(true);
    expect(equalValues(2.5, 2.5000001)).toBe(true);
    expect(equalValues(2.5, 2.6)).toBe(false);
  });

  it("compares arrays element-wise and in order", () => {
    expect(equalValues([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(equalValues([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(equalValues([[1], [2]], [[1], [2]])).toBe(true);
    expect(equalValues([1, 2], [1, 2, 3])).toBe(false);
  });

  it("keeps null distinct from a missing value", () => {
    expect(equalValues([1, null, 3], [1, null, 3])).toBe(true);
    expect(equalValues([1, null, 3], [1, 0, 3])).toBe(false);
  });

  it("treats unparseable output as a failure rather than a crash", () => {
    // Output the harness did not write means the sandbox printed something
    // unexpected. That is a failure, and the one thing it must never be is a
    // pass.
    expect(matches("1", "not json")).toBe(false);
    expect(matches("1", "")).toBe(false);
    expect(matches("1", "1")).toBe(true);
  });

  it("matches neither NaN nor an infinity, even with itself", () => {
    // Unreachable through the wire - JSON can encode neither, and every
    // harness writes null instead - but the rule is worth pinning: a value
    // nothing can equal must not accidentally equal itself.
    expect(equalValues(Number.NaN, Number.NaN)).toBe(false);
    expect(equalValues(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(false);
  });
});

// ── Harness generation ─────────────────────────────────────────────────────

describe("harness generation", () => {
  it("offers a runtime for all five catalog languages", () => {
    for (const language of [
      "JAVASCRIPT",
      "TYPESCRIPT",
      "PYTHON",
      "JAVA",
      "CPP",
    ] as const) {
      expect(runtimeFor(language).language).toBe(language);
    }
  });

  it("calls the entry point it was given, and writes results to a file", () => {
    const program = buildProgram(request({ entryPoint: "find_maximum" }));
    expect(program.files["main.py"]).toContain("find_maximum(");
    // Results go to a file rather than to stdout, so a learner can leave their
    // debugging prints in without corrupting the grading protocol.
    expect(program.files["main.py"]).toContain("/work/results.jsonl");
  });

  it("hands the dynamic languages their cases as data, not as source", () => {
    for (const language of ["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA"] as const) {
      const program = buildProgram(
        request({ language, code: "// x", entryPoint: "solve" }),
      );
      expect(program.files["cases.json"]).toBe("[[1],[5]]");
    }
  });

  it("compiles every language before running it", () => {
    // Including the two that have no compiler: `node --check` and py_compile
    // exist so that a missing bracket is a compilation error rather than a
    // crash on the first test case, which needs completely different advice.
    for (const language of [
      "JAVASCRIPT",
      "TYPESCRIPT",
      "PYTHON",
      "JAVA",
      "CPP",
    ] as const) {
      const program = buildProgram(request({ language, code: "// x" }));
      expect(program.compile).not.toBeNull();
      expect(program.run.length).toBeGreaterThan(0);
    }
  });

  it("caps the JVM's heap and V8's at the problem's limit", () => {
    const java = buildProgram(request({ language: "JAVA", memoryLimitMb: 200 }));
    expect(java.run).toContain("-Xmx200m");

    const node = buildProgram(request({ language: "JAVASCRIPT", memoryLimitMb: 200 }));
    expect(node.run).toContain("--max-old-space-size=200");
  });

  it("keeps the learner's classpath to their own classes and the harness", () => {
    const java = buildProgram(request({ language: "JAVA" }));
    const classpath = java.run[java.run.indexOf("-cp") + 1];
    expect(classpath).toBe("/work:/opt/cc/java");
  });

  it("spells C++ arguments as braced lists, so the compiler deduces the type", () => {
    // This is what lets the service generate a C++ harness without knowing a
    // problem's parameter types: the declared type does the conversion.
    expect(cppLiteral([3, 9, 2])).toBe("{3, 9, 2}");
    expect(cppLiteral([[1, 2], [3]])).toBe("{{1, 2}, {3}}");
    expect(cppLiteral([])).toBe("{}");
    expect(cppLiteral(true)).toBe("true");
    expect(cppLiteral(7)).toBe("7");
  });

  it("spells a missing tree child as nullopt", () => {
    // int?[] exists for exactly one thing: the level-order serialisation of a
    // binary tree, where null means there is no child here.
    expect(cppLiteral([3, null, 9])).toBe("{3, std::nullopt, 9}");
  });

  it("escapes a C++ string so the generated source stays valid ASCII", () => {
    const literal = cppLiteral('he said "no"\nover\tthere \\ café');
    expect(literal.startsWith('"')).toBe(true);
    expect(literal).toContain('\\"');
    expect(literal).toContain("\\n");
    expect(literal).toContain("\\t");
    expect(literal).toContain("\\\\");
    // Non-ASCII becomes a universal character name, so the file cannot depend
    // on the compiler's idea of the input encoding.
    expect(literal).toContain("\\u00e9");
    // eslint-disable-next-line no-control-regex
    expect(/[^\x00-\x7f]/.test(literal)).toBe(false);
  });

  it("puts a control character in its own literal, so the hex escape cannot run on", () => {
    // "\x0ab" would be read as one long hex escape; "\x0a" "b" is two chars.
    expect(cppLiteral("b")).toBe('"\\x01" "b"');
  });
});

// ── The queue ──────────────────────────────────────────────────────────────

describe("bounded execution capacity", () => {
  it("runs no more than the configured number at once", async () => {
    const queue = new ExecutionQueue(2, 10, 1_000);
    let running = 0;
    let peak = 0;

    const work = async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 10));
      running -= 1;
      return true;
    };

    await Promise.all(Array.from({ length: 8 }, () => queue.run(work)));

    expect(peak).toBe(2);
    expect(queue.stats().completed).toBe(8);
  });

  it("refuses rather than queues once the queue is full", async () => {
    // A service that accepts everything and lets it time out looks healthy
    // while being useless. One that says "busy" lets the caller show a learner
    // something true and lets a load balancer shed traffic.
    const queue = new ExecutionQueue(1, 1, 1_000);
    const slow = () =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 50));

    const first = queue.run(slow);
    const second = queue.run(slow);
    const third = queue.run(slow).catch((error: unknown) => error);

    await expect(third).resolves.toBeInstanceOf(QueueFull);
    await first;
    await second;
    expect(queue.stats().rejected).toBe(1);
  });

  it("gives up on a wait nobody is still listening for", async () => {
    const queue = new ExecutionQueue(1, 4, 20);
    const slow = () =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 200));

    const holder = queue.run(slow);
    await expect(queue.run(slow)).rejects.toBeInstanceOf(QueueFull);
    await holder;
  });

  it("releases the slot when the work throws", async () => {
    const queue = new ExecutionQueue(1, 4, 1_000);
    await expect(
      queue.run(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(queue.stats().running).toBe(0);
    await expect(queue.run(async () => "fine")).resolves.toMatchObject({
      result: "fine",
    });
  });
});

// ── Message scrubbing ──────────────────────────────────────────────────────

describe("message scrubbing", () => {
  it("keeps the part of a compiler error a learner can act on", () => {
    const cleaned = scrub("/work/main.cpp:12:5: error: expected ';' before '}' token");
    expect(cleaned).toContain("error: expected ';'");
    expect(cleaned).toContain("your code");
    expect(cleaned).not.toContain("/work/main.cpp");
  });

  it("removes the sandbox's own layout", () => {
    const cleaned = scrub("Traceback: /opt/cc/runner.py line 40, /work/scratch/tmp.o");
    expect(cleaned).not.toContain("/opt/cc");
    expect(cleaned).not.toContain("/work/scratch");
  });

  it("removes addresses, URLs and container ids", () => {
    const cleaned = scrub(
      "connect to http://10.0.0.4:5432 failed from container a3f9c1b2d4e5f6a7",
    );
    expect(cleaned).not.toContain("10.0.0.4");
    expect(cleaned).not.toContain("http://");
    expect(cleaned).not.toContain("a3f9c1b2d4e5f6a7");
  });

  it("returns nothing when nothing useful survives", () => {
    // "<path>: <id>" tells a learner nothing and tells an attacker they hit
    // something.
    expect(scrub("/var/lib/secret/thing : a3f9c1b2d4e5f6a7")).toBeNull();
    expect(scrub("")).toBeNull();
    expect(scrub(null)).toBeNull();
  });

  it("caps a message that will not stop", () => {
    const cleaned = scrub("error\n".repeat(5_000));
    expect(cleaned!.length).toBeLessThan(5_000);
  });
});

// ── Provider selection, on the application's side ──────────────────────────

describe("provider selection", () => {
  async function withProvider<T>(
    env: Record<string, string | undefined>,
    body: (module: typeof import("@/lib/practice/execution")) => Promise<T> | T,
  ): Promise<T> {
    const module = await import("@/lib/practice/execution");
    const previous: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(env)) {
      previous[key] = process.env[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    module.__setExecutionServiceForTests(undefined);
    try {
      return await body(module);
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      module.__setExecutionServiceForTests(undefined);
    }
  }

  it("builds the sandbox provider from CODE_EXECUTION_PROVIDER=sandbox", async () => {
    await withProvider(
      {
        CODE_EXECUTION_PROVIDER: "sandbox",
        CODE_EXECUTION_URL: "https://exec.test/v1/execute",
      },
      (module) => {
        expect(module.getExecutionService().name).toBe("http");
        expect(module.getExecutionService().simulated).toBe(false);
      },
    );
  });

  it("still answers to the older name for the same provider", async () => {
    // `http` shipped first and described the transport. Renaming it to
    // `sandbox` must not take an existing deployment down on upgrade.
    await withProvider(
      {
        CODE_EXECUTION_PROVIDER: "http",
        CODE_EXECUTION_URL: "https://exec.test/v1/execute",
      },
      (module) => {
        expect(module.getExecutionService().name).toBe("http");
      },
    );
  });

  it("falls back to running nothing when the sandbox has no URL", async () => {
    await withProvider(
      { CODE_EXECUTION_PROVIDER: "sandbox", CODE_EXECUTION_URL: undefined },
      (module) => {
        expect(module.getExecutionService().name).toBe("none");
        expect(module.getExecutionService().supportedLanguages()).toEqual([]);
      },
    );
  });

  it("refuses simulated verdicts in production", async () => {
    await withProvider(
      { CODE_EXECUTION_PROVIDER: "mock", NODE_ENV: "production" },
      (module) => {
        expect(module.getExecutionService().name).toBe("none");
      },
    );
  });
});

// ── Health ─────────────────────────────────────────────────────────────────

describe("execution health", () => {
  it("asks the service without running anything", async () => {
    const { HttpExecutionService } = await import("@/lib/practice/execution");
    const calls: { url: string; method: string | undefined }[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ url: String(url), method: init.method });
        return new Response("{}", { status: 200 });
      }),
    );

    const service = new HttpExecutionService("https://exec.test/v1/execute", "secret");
    const health = await service.health();

    expect(health.available).toBe(true);
    expect(calls[0].method).toBe("GET");
    expect(calls[0].url).toBe("https://exec.test/health");

    vi.unstubAllGlobals();
  });

  it("reports an unreachable service without describing it", async () => {
    const { HttpExecutionService } = await import("@/lib/practice/execution");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED 10.1.2.3:8080");
      }),
    );

    const service = new HttpExecutionService("https://exec.test/v1/execute", undefined);
    const health = await service.health();

    expect(health.available).toBe(false);
    expect(health.detail).not.toContain("10.1.2.3");

    vi.unstubAllGlobals();
  });

  it("says the development provider is available and simulated", async () => {
    const { MockExecutionService } = await import("@/lib/practice/execution");
    const health = await new MockExecutionService().health();
    expect(health.available).toBe(true);
    expect(health.detail).toContain("simulated");
  });

  it("says nothing is configured when nothing is", async () => {
    const { UnavailableExecutionService } = await import("@/lib/practice/execution");
    const health = await new UnavailableExecutionService().health();
    expect(health.available).toBe(false);
  });
});

// ── The output limit, end to end through the application ───────────────────

describe("the output limit reaches the learner as its own verdict", () => {
  it("is carried by the HTTP provider", async () => {
    const { HttpExecutionService } = await import("@/lib/practice/execution");

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              status: "OUTPUT_LIMIT",
              outcomes: [{ order: 1, passed: false }],
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      ),
    );

    const service = new HttpExecutionService("https://exec.test/v1/execute", undefined);
    const result = await service.execute({
      language: "PYTHON",
      code: "x",
      entryPoint: "solve",
      tests: [{ order: 1, input: "[]", expectedOutput: "1", isHidden: false }],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    });

    expect(result.status).toBe("OUTPUT_LIMIT");

    vi.unstubAllGlobals();
  });

  it("is explained as a stray print, not as a crash", async () => {
    const { buildFeedback, STATUS_LABEL, STATUS_TONE } =
      await import("@/lib/practice/feedback");

    const { feedback, failure } = buildFeedback(
      {
        status: "OUTPUT_LIMIT",
        passedTests: 0,
        totalTests: 2,
        executionTime: null,
        memoryUsed: null,
        message: null,
        outcomes: [],
        simulated: false,
      },
      [],
      { timeLimitMs: 2000, memoryLimitMb: 128 },
    );

    expect(STATUS_LABEL.OUTPUT_LIMIT).toBe("Output Limit Exceeded");
    expect(STATUS_TONE.OUTPUT_LIMIT).toBe("failure");
    expect(feedback).toContain("printed");
    // No failing-case detail: nothing was compared, so there is nothing to show.
    expect(failure).toBeNull();
  });

  it("can be simulated by the development provider", async () => {
    const { MockExecutionService } = await import("@/lib/practice/execution");
    const result = await new MockExecutionService().execute({
      language: "PYTHON",
      code: "# @mock:output",
      entryPoint: "solve",
      tests: [{ order: 1, input: "[]", expectedOutput: "1", isHidden: false }],
      timeLimitMs: 2000,
      memoryLimitMb: 128,
    });

    expect(result.status).toBe("OUTPUT_LIMIT");
    expect(result.simulated).toBe(true);
  });
});
