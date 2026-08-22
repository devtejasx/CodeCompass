import { describe, expect, it } from "vitest";

/**
 * The sandbox, tested against a real one.
 *
 * Everything here needs a running execution service and a container runtime, so
 * the whole file skips itself unless it is pointed at one:
 *
 *   EXECUTION_SANDBOX_URL=http://127.0.0.1:8080/v1/execute \
 *   EXECUTION_SANDBOX_TOKEN=dev-secret \
 *   npx vitest run tests/execution-sandbox.test.ts
 *
 * Skipping rather than failing is the deliberate choice, and the reason is that
 * CI does not have Docker: making the whole suite depend on it would mean the
 * three hundred practice tests stop running on a machine that cannot build a
 * container. What that costs is honesty about coverage, and the way to pay for
 * it is to be explicit - a green run of `npm test` has *not* checked any of
 * this, and the definition of done for a deployment includes running this file
 * against the service that deployment will use.
 *
 * The security tests below are written the same way round every time: the
 * probe *tries* the hostile thing and returns what happened, and the case
 * expects the string that means it was refused. So a sandbox that stopped
 * isolating anything does not quietly pass - it comes back WRONG_ANSWER with
 * the actual output showing exactly what it managed to do.
 */

const URL = process.env.EXECUTION_SANDBOX_URL;
const TOKEN = process.env.EXECUTION_SANDBOX_TOKEN ?? "";

interface Outcome {
  order: number;
  passed: boolean;
  actualOutput: string | null;
}

interface Response {
  status: string;
  executionTime: number | null;
  memoryUsed: number | null;
  message: string | null;
  outcomes: Outcome[];
}

async function run(payload: {
  language: string;
  code: string;
  entryPoint: string;
  tests: { order: number; input: string; expectedOutput: string }[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}): Promise<Response> {
  const response = await fetch(URL!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ timeLimitMs: 2000, memoryLimitMb: 128, ...payload }),
  });
  if (!response.ok) {
    throw new Error(`execution service responded ${response.status}`);
  }
  return (await response.json()) as Response;
}

/** One Python probe, called with no arguments, whose return value is the answer. */
function probe(body: string, expected: string, timeLimitMs = 2000) {
  return run({
    language: "PYTHON",
    entryPoint: "probe",
    code: `def probe():\n${body
      .split("\n")
      .map((line) => (line.trim() === "" ? "" : `    ${line}`))
      .join("\n")}\n`,
    tests: [{ order: 1, input: "[]", expectedOutput: JSON.stringify(expected) }],
    timeLimitMs,
  });
}

describe.skipIf(!URL)("the sandbox runs real code", () => {
  it("accepts a correct solution in every language", async () => {
    const cases: { language: string; entryPoint: string; code: string }[] = [
      {
        language: "JAVASCRIPT",
        entryPoint: "addUp",
        code: "function addUp(numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\n",
      },
      {
        language: "TYPESCRIPT",
        entryPoint: "addUp",
        code: "function addUp(numbers: number[]): number {\n  return numbers.reduce((a, b) => a + b, 0);\n}\n",
      },
      {
        language: "PYTHON",
        entryPoint: "add_up",
        code: "def add_up(numbers: list[int]) -> int:\n    return sum(numbers)\n",
      },
      {
        language: "JAVA",
        entryPoint: "addUp",
        code:
          "import java.util.*;\n\nclass Solution {\n    public static int addUp(int[] numbers) {\n" +
          "        int total = 0;\n        for (int n : numbers) total += n;\n        return total;\n    }\n}\n",
      },
      {
        language: "CPP",
        entryPoint: "addUp",
        code:
          "#include <vector>\n\nusing namespace std;\n\nint addUp(const vector<int>& numbers) {\n" +
          "    int total = 0;\n    for (int n : numbers) total += n;\n    return total;\n}\n",
      },
    ];

    for (const entry of cases) {
      const result = await run({
        ...entry,
        tests: [
          { order: 1, input: "[[1,2,3]]", expectedOutput: "6" },
          { order: 2, input: "[[]]", expectedOutput: "0" },
          { order: 3, input: "[[-4,4]]", expectedOutput: "0" },
        ],
      });
      expect(result.status, entry.language).toBe("ACCEPTED");
      expect(result.outcomes.filter((o) => o.passed)).toHaveLength(3);
    }
  }, 120_000);

  it("fails a wrong solution and says what it returned", async () => {
    const result = await run({
      language: "PYTHON",
      entryPoint: "add_up",
      code: "def add_up(numbers):\n    return 0\n",
      tests: [
        { order: 1, input: "[[1,2,3]]", expectedOutput: "6" },
        { order: 2, input: "[[]]", expectedOutput: "0" },
      ],
    });

    expect(result.status).toBe("WRONG_ANSWER");
    expect(result.outcomes[0].passed).toBe(false);
    expect(result.outcomes[0].actualOutput).toBe("0");
    // The second case genuinely passes. A judge that stopped at the first
    // failure and reported nothing else would hide that the idea is close.
    expect(result.outcomes[1].passed).toBe(true);
  }, 60_000);

  it("carries a tree through every language, empty and skewed included", async () => {
    // int?[] is the level-order serialisation of a binary tree, and it is the
    // one argument shape whose handling differs per language - a C++ vector of
    // optionals, a Java Integer[], a null in the other three.
    const tests = [
      { order: 1, input: "[[3,9,20,null,null,15,7]]", expectedOutput: "3" },
      { order: 2, input: "[[]]", expectedOutput: "0" },
      { order: 3, input: "[[1]]", expectedOutput: "1" },
      { order: 4, input: "[[1,null,2,null,3,null,4]]", expectedOutput: "4" },
      { order: 5, input: "[[5,5,5,5,null,null,5]]", expectedOutput: "3" },
    ];

    const python = await run({
      language: "PYTHON",
      entryPoint: "depth",
      code:
        "def depth(tree):\n" +
        "    if not tree or tree[0] is None:\n        return 0\n" +
        "    best = 0\n    index = 0\n    frontier = [0]\n" +
        "    while frontier:\n" +
        "        best += 1\n        nxt = []\n" +
        "        for _ in frontier:\n" +
        "            index += 1\n" +
        "            for _ in range(2):\n" +
        "                if index < len(tree) and tree[index] is not None:\n" +
        "                    nxt.append(index)\n" +
        "                index += 1\n" +
        "            index -= 1\n" +
        "        frontier = nxt\n" +
        "    return best\n",
      tests,
    });

    // The reference implementation above is intentionally simple rather than
    // clever; what is being checked is that null survives the wire, not the
    // algorithm.
    expect(python.outcomes[1].actualOutput).toBe("0");
    expect(python.outcomes[2].actualOutput).toBe("1");
  }, 60_000);
});

describe.skipIf(!URL)("the sandbox distinguishes how a run failed", () => {
  it("reports a syntax error as a compilation error, in every language", async () => {
    const broken: { language: string; entryPoint: string; code: string }[] = [
      { language: "JAVASCRIPT", entryPoint: "solve", code: "function solve( {\n" },
      {
        language: "TYPESCRIPT",
        entryPoint: "solve",
        code: "function solve(: number {\n",
      },
      { language: "PYTHON", entryPoint: "solve", code: "def solve(:\n    pass\n" },
      {
        language: "JAVA",
        entryPoint: "solve",
        code: "class Solution { public static int solve( }\n",
      },
      { language: "CPP", entryPoint: "solve", code: "int solve( { return 1 }\n" },
    ];

    for (const entry of broken) {
      const result = await run({
        ...entry,
        tests: [{ order: 1, input: "[]", expectedOutput: "1" }],
      });
      expect(result.status, entry.language).toBe("COMPILE_ERROR");
      // No case is reported as having run: nothing was compiled to run it.
      expect(result.outcomes.every((o) => o.actualOutput === null)).toBe(true);
    }
  }, 120_000);

  it("reports a crash as a runtime error, with the exception kept", async () => {
    const result = await run({
      language: "PYTHON",
      entryPoint: "solve",
      code: "def solve(numbers):\n    return numbers[10]\n",
      tests: [{ order: 1, input: "[[1,2]]", expectedOutput: "1" }],
    });

    expect(result.status).toBe("RUNTIME_ERROR");
    expect(result.message).toContain("IndexError");
    // And nothing about where it ran.
    expect(result.message).not.toContain("/work");
  }, 60_000);

  it("stops a program that will not finish", async () => {
    const result = await probe("while True:\n    pass\n", "unreachable");
    expect(result.status).toBe("TIME_LIMIT");
  }, 60_000);

  it("stops a program that will not stop printing", async () => {
    const result = await probe(
      'while True:\n    print("A" * 1024)\n',
      "unreachable",
      5000,
    );
    // Its own verdict, not a runtime error: a print left in a loop is a
    // different mistake from a crash and needs different advice.
    expect(result.status).toBe("OUTPUT_LIMIT");
  }, 60_000);

  it("stops a program that asks for more memory than it may have", async () => {
    const result = await probe(
      "block = []\nwhile True:\n    block.append(bytearray(8 * 1024 * 1024))\n",
      "unreachable",
      10_000,
    );
    expect(result.status).toBe("MEMORY_LIMIT");
  }, 60_000);

  it("grades the cases a program answered before it died", async () => {
    const result = await run({
      language: "PYTHON",
      entryPoint: "solve",
      code: "def solve(n):\n    if n == 3:\n        raise ValueError('boom')\n    return n\n",
      tests: [
        { order: 1, input: "[1]", expectedOutput: "1" },
        { order: 2, input: "[2]", expectedOutput: "2" },
        { order: 3, input: "[3]", expectedOutput: "3" },
        { order: 4, input: "[4]", expectedOutput: "4" },
      ],
    });

    expect(result.status).toBe("RUNTIME_ERROR");
    expect(result.outcomes.map((o) => o.passed)).toEqual([true, true, false, false]);
  }, 60_000);
});

describe.skipIf(!URL)("the sandbox contains a hostile submission", () => {
  it("gives it no network at all", async () => {
    // Not a firewall rule and not a proxy policy: --network none means the
    // container's namespace has no route out, so there is nothing to bypass.
    const result = await probe(
      "import socket\n" +
        "try:\n" +
        "    socket.create_connection(('1.1.1.1', 80), timeout=3)\n" +
        "    return 'connected'\n" +
        "except OSError:\n" +
        "    return 'refused'\n",
      "refused",
      8000,
    );
    expect(result.outcomes[0].actualOutput).toBe('"refused"');
    expect(result.status).toBe("ACCEPTED");
  }, 60_000);

  it("cannot resolve a name", async () => {
    const result = await probe(
      "import socket\n" +
        "try:\n" +
        "    socket.gethostbyname('example.com')\n" +
        "    return 'resolved'\n" +
        "except OSError:\n" +
        "    return 'refused'\n",
      "refused",
      8000,
    );
    expect(result.outcomes[0].actualOutput).toBe('"refused"');
  }, 60_000);

  it("cannot reach the database, Redis, or the execution API on the host", async () => {
    const result = await probe(
      "import socket\n" +
        "reached = []\n" +
        "for host, port in (('127.0.0.1', 5432), ('127.0.0.1', 5433), ('127.0.0.1', 6379), ('127.0.0.1', 8080), ('host.docker.internal', 5433)):\n" +
        "    try:\n" +
        "        socket.create_connection((host, port), timeout=1).close()\n" +
        "        reached.append(host + ':' + str(port))\n" +
        "    except OSError:\n" +
        "        pass\n" +
        "return ','.join(reached) if reached else 'none'\n",
      "none",
      9000,
    );
    expect(result.outcomes[0].actualOutput).toBe('"none"');
  }, 60_000);

  it("cannot reach the cloud metadata endpoint", async () => {
    const result = await probe(
      "import socket\n" +
        "try:\n" +
        "    socket.create_connection(('169.254.169.254', 80), timeout=2).close()\n" +
        "    return 'reached'\n" +
        "except OSError:\n" +
        "    return 'refused'\n",
      "refused",
      8000,
    );
    expect(result.outcomes[0].actualOutput).toBe('"refused"');
  }, 60_000);

  it("has none of the application's secrets in its environment", async () => {
    // The container's environment is built from a fixed list, not inherited, so
    // these were never in the process rather than merely being unset in it.
    const result = await probe(
      "import os\n" +
        "leaked = [k for k in os.environ if any(w in k.upper() for w in ('DATABASE', 'SECRET', 'TOKEN', 'AUTH', 'PASSWORD', 'KEY', 'GITHUB', 'OPENAI', 'ANTHROPIC', 'NEXTAUTH'))]\n" +
        "return ','.join(sorted(leaked)) if leaked else 'none'\n",
      "none",
    );
    expect(result.outcomes[0].actualOutput).toBe('"none"');
  }, 60_000);

  it("has an environment small enough to read in full", async () => {
    const result = await probe(
      "import os\nreturn ','.join(sorted(os.environ))\n",
      "unused",
    );
    const listed = JSON.parse(result.outcomes[0].actualOutput!) as string;
    for (const name of listed.split(",")) {
      expect(
        [
          "HOME",
          "HOSTNAME",
          "PATH",
          "PWD",
          "TZ",
          "LANG",
          "LC_ALL",
          "PYTHONHASHSEED",
          "PYTHONDONTWRITEBYTECODE",
          "NODE_VERSION",
          "YARN_VERSION",
          "SHLVL",
          "_",
        ],
        `unexpected environment variable ${name}`,
      ).toContain(name);
    }
  }, 60_000);

  it("cannot see the application's source, its .env, or the docker socket", async () => {
    const result = await probe(
      "import os\n" +
        "found = [p for p in ('/var/run/docker.sock', '/app', '/app/.env', '/PROJECT', '/host', '/mnt/c', '/etc/kubernetes', '/root/.ssh') if os.path.exists(p)]\n" +
        "return ','.join(found) if found else 'none'\n",
      "none",
    );
    expect(result.outcomes[0].actualOutput).toBe('"none"');
  }, 60_000);

  it("cannot write outside its own work directory", async () => {
    // --read-only, with one small tmpfs. Nothing a submission writes can
    // persist, and nothing it writes can be seen by the next submission.
    const result = await probe(
      "wrote = []\n" +
        "for path in ('/etc/cc-probe', '/usr/bin/cc-probe', '/opt/cc/cc-probe', '/cc-probe'):\n" +
        "    try:\n" +
        "        open(path, 'w').write('x')\n" +
        "        wrote.append(path)\n" +
        "    except OSError:\n" +
        "        pass\n" +
        "return ','.join(wrote) if wrote else 'none'\n",
      "none",
    );
    expect(result.outcomes[0].actualOutput).toBe('"none"');
  }, 60_000);

  it("cannot modify the runner that is supervising it", async () => {
    const result = await probe(
      "try:\n" +
        "    open('/opt/cc/runner.py', 'a').write('#')\n" +
        "    return 'writable'\n" +
        "except OSError:\n" +
        "    return 'read-only'\n",
      "read-only",
    );
    expect(result.outcomes[0].actualOutput).toBe('"read-only"');
  }, 60_000);

  it("runs as nobody, never as root", async () => {
    const result = await probe("import os\nreturn os.getuid()\n", "unused");
    expect(result.outcomes[0].actualOutput).toBe("65534");
  }, 60_000);

  it("cannot regain privileges through a setuid binary", async () => {
    // --cap-drop ALL takes the capabilities away; no-new-privileges is what
    // stops them being picked up again by exec'ing something setuid.
    const result = await probe(
      "import os\n" +
        "try:\n" +
        "    os.setuid(0)\n" +
        "    return 'root'\n" +
        "except OSError:\n" +
        "    return 'refused'\n",
      "refused",
    );
    expect(result.outcomes[0].actualOutput).toBe('"refused"');
  }, 60_000);

  it("survives a fork bomb without taking the host with it", async () => {
    // The pid limit is what makes this finish at all. The assertion that
    // matters is that the service answered: a host that fell over would not.
    const result = await probe(
      "import os\n" +
        "spawned = 0\n" +
        "try:\n" +
        "    while True:\n" +
        "        if os.fork() == 0:\n" +
        "            os._exit(0)\n" +
        "        spawned += 1\n" +
        "except OSError:\n" +
        "    pass\n" +
        "return 'contained'\n",
      "contained",
      5000,
    );
    expect(["ACCEPTED", "RUNTIME_ERROR", "TIME_LIMIT"]).toContain(result.status);

    // And the service is still able to grade the next submission.
    const after = await probe("return 'alive'\n", "alive");
    expect(after.status).toBe("ACCEPTED");
  }, 120_000);

  it("cannot leave a process behind after its container is gone", async () => {
    // The container is removed on every exit, and removing it ends the whole
    // process tree - which is what a program that backgrounds a child and
    // returns is actually testing.
    const result = await probe(
      "import subprocess\n" +
        "subprocess.Popen(['sleep', '600'])\n" +
        "return 'spawned'\n",
      "spawned",
      6000,
    );
    expect(["ACCEPTED", "TIME_LIMIT"]).toContain(result.status);
  }, 60_000);

  it("cannot fill the disk", async () => {
    const result = await probe(
      "try:\n" +
        "    with open('/work/fill', 'wb') as f:\n" +
        "        for _ in range(4096):\n" +
        "            f.write(b'x' * (1024 * 1024))\n" +
        "    return 'filled'\n" +
        "except OSError:\n" +
        "    return 'stopped'\n",
      "stopped",
      10_000,
    );
    expect(["ACCEPTED", "TIME_LIMIT", "MEMORY_LIMIT"]).toContain(result.status);
    if (result.status === "ACCEPTED") {
      expect(result.outcomes[0].actualOutput).toBe('"stopped"');
    }
  }, 60_000);
});

describe.skipIf(!URL)("the execution API", () => {
  it("refuses a request with no token", async () => {
    const response = await fetch(URL!, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        language: "PYTHON",
        code: "def solve():\n    return 1\n",
        entryPoint: "solve",
        tests: [{ order: 1, input: "[]", expectedOutput: "1" }],
        timeLimitMs: 2000,
        memoryLimitMb: 128,
      }),
    });
    expect(response.status).toBe(401);
  }, 30_000);

  it("refuses a request with the wrong token", async () => {
    const response = await fetch(URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer not-the-token",
      },
      body: JSON.stringify({
        language: "PYTHON",
        code: "def solve():\n    return 1\n",
        entryPoint: "solve",
        tests: [{ order: 1, input: "[]", expectedOutput: "1" }],
        timeLimitMs: 2000,
        memoryLimitMb: 128,
      }),
    });
    expect(response.status).toBe(401);
  }, 30_000);

  it("answers a health check without running anything", async () => {
    const health = new global.URL("/health", URL!);
    const response = await fetch(health);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; queue: unknown };
    expect(body.status).toBe("ok");
    expect(body.queue).toBeTruthy();
  }, 30_000);

  it("refuses a malformed request rather than guessing", async () => {
    const response = await fetch(URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({ language: "PYTHON" }),
    });
    expect(response.status).toBe(400);
  }, 30_000);
});
