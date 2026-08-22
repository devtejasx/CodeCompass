# Code execution

> **Status: implemented.** Practice submissions are compiled and run for real,
> in a throwaway container per submission, in all five catalog languages. The
> development provider still exists and still simulates; it has to be asked for
> by name and is refused in production.

---

## The rule

**CodeCompass never executes learner code in the application process.**

No file in this repository's `src/` may use `eval`, `new Function`, `node:vm`,
`child_process`, `worker_threads`, a database language handler, or any
equivalent, to run a submission. Learner code is hostile input. It is handed
across a network boundary to something whose entire job is to contain it, and
the only thing that comes back is a verdict.

`tests/practice.test.ts` enforces the rule by reading the source of
`src/lib/practice/execution/` and failing on any executable use of those APIs.

```
Browser
  │  code + problem + language
  ▼
Next.js server action            src/app/actions/practice.ts
  │  hidden tests and the reference solution are read HERE and go no further
  ▼
CodeExecutionService             src/lib/practice/execution/
  │
  ├── none      nothing runs; Run and Submit are disabled and say why
  ├── mock      deterministic simulated verdicts, development only
  └── sandbox   HTTPS ──────────────────────────────────────────┐
                                                                ▼
                                        Execution service   services/execution/
                                                │  bounded queue
                                                ▼
                                          Language runtime  (harness generation)
                                                │
                                                ▼
                                        Throwaway container  (no network,
                                                │             no secrets,
                                                ▼             non-root)
                                          compile -> run -> results.jsonl
                                                │
                                                ▼
                                          Verdict + timings
                                                │
  ┌─────────────────────────────────────────────┘
  ▼
Application: compare, scrub, store   Submission row + UserProblemProgress
  │
  ▼
Browser: status, timings, and failure detail for visible cases only
```

---

## Repository layout

| Path | Role |
| --- | --- |
| `src/lib/practice/execution/types.ts` | `CodeExecutionService`, request/result shapes, hard limits |
| `src/lib/practice/execution/index.ts` | Provider selection from the environment |
| `src/lib/practice/execution/http-provider.ts` | The sandbox provider — talks to the service |
| `src/lib/practice/execution/mock-provider.ts` | Development only — simulates, never executes |
| `src/lib/practice/execution/sanitise.ts` | Scrubs paths, URLs, addresses and ids out of every message |
| `services/execution/` | The execution service. A separate deployable, no npm dependencies |
| `services/execution/runner/` | The sandbox image and the in-container runner |

`services/execution` is not part of the Next.js build. It is excluded from the
root `tsconfig.json` and has its own; `npm run typecheck` compiles both.

---

## Providers

Selected with `CODE_EXECUTION_PROVIDER`.

### `none` — the default

Nothing runs. `supportedLanguages()` returns an empty list, so the problem page
disables Run and Submit and explains why. Every `execute` returns
`SYSTEM_ERROR`, which the UI renders as *"Code execution is temporarily
unavailable. Your code has not been lost."*

This is deliberately the default. A misconfigured deployment must fail closed
and say so, not quietly hand out verdicts.

### `mock` — development only

Returns a deterministic verdict **without running anything**:

1. A `@mock:<status>` marker in a comment forces that status — `accepted`,
   `wrong`, `timeout`, `memory`, `output`, `compile-error`, `runtime-error`,
   `system-error`. This is how the test suite exercises every result state
   without a compiler.
2. Source still identical to the starter code fails with nothing passed.
3. Source matching the authored reference solution is accepted.
4. Anything else fails and says plainly that the development provider cannot
   grade arbitrary code.

Every result carries `simulated: true`; the workspace shows a permanent amber
banner and the result panel repeats it. **Requesting `mock` while
`NODE_ENV=production` is refused** and the application falls back to `none`.

### `sandbox` — production

Posts to `CODE_EXECUTION_URL` with `Authorization: Bearer
$CODE_EXECUTION_TOKEN`. The request is bounded by an `AbortController` at 20
seconds. The response is validated against a schema, and outcomes are re-keyed
against *our* test list — a response that invents or omits cases cannot change
how many tests a learner is graded on.

`CODE_EXECUTION_LANGUAGES` narrows the offered languages by intersection; an
unknown name in it is ignored rather than added.

`http` is accepted as the older name for this provider and behaves identically.

---

## The service contract

### Request

```http
POST /v1/execute
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "language": "PYTHON",
  "code": "def find_maximum(numbers: list[int]) -> int:\n    return max(numbers)",
  "entryPoint": "find_maximum",
  "timeLimitMs": 2000,
  "memoryLimitMb": 128,
  "tests": [
    { "order": 1, "input": "[[3,9,2,7]]", "expectedOutput": "9" },
    { "order": 2, "input": "[[-8,-3,-20]]", "expectedOutput": "-3" }
  ]
}
```

`input` is a JSON **array of arguments**; `expectedOutput` is a JSON **value**.
The harness deserialises the arguments, calls `entryPoint` with them spread as
parameters, records the return value as JSON, and the service compares. Because
the contract is JSON on both sides, one authored test case runs unchanged in
every language.

**The payload carries no type information, and does not need to.** C++ spells
arguments as braced initialiser lists and lets the declared parameter type do
the conversion, and prints return values through an overload set. Java reflects
over `Solution` and reads the declared parameter types off the method. So
neither the wire format nor the database has to describe a problem's signature —
which is why adding real execution needed no change to the 300-problem catalog.

The reference solution is **never** part of this payload.
`http-provider.ts` builds the body field by field precisely so it cannot ride
along, and `tests/practice.test.ts` asserts on the serialised bytes.

### Response

```json
{
  "status": "WRONG_ANSWER",
  "executionTime": 41,
  "memoryUsed": 9216,
  "message": null,
  "outcomes": [
    { "order": 1, "passed": true,  "actualOutput": "9" },
    { "order": 2, "passed": false, "actualOutput": "-20" }
  ]
}
```

| Field | Notes |
| --- | --- |
| `status` | One of `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT`, `MEMORY_LIMIT`, `OUTPUT_LIMIT`, `COMPILE_ERROR`, `RUNTIME_ERROR`, `SYSTEM_ERROR` |
| `executionTime` | Wall-clock milliseconds for the run, excluding compilation, or `null` |
| `memoryUsed` | Peak resident set of the program in kilobytes, or `null` |
| `message` | Compiler or runtime text, already scrubbed. `null` for a pass or a wrong answer |
| `outcomes` | One entry per test `order`. Extra or missing entries are ignored / treated as failures |

`GET /health` answers `200` with `{"status":"ok",…}` or `503` with
`{"status":"unavailable",…}`. It runs nothing.

### Verdicts the service keeps to itself

The service distinguishes three states the application's `SubmissionStatus`
enum does not hold, because an operator reading a log needs them and a learner
does not:

| Internal | On the wire | Why |
| --- | --- | --- |
| `PROCESS_LIMIT` | `RUNTIME_ERROR` | Their program asked for a thread it could not have and died. That is a runtime error from where they are sitting |
| `ENVIRONMENT_ERROR` | `SYSTEM_ERROR` | The image is missing, the daemon is down, the runner could not start. Not their fault, so no attempt is recorded |
| `INTERNAL_ERROR` | `SYSTEM_ERROR` | Our bug |

`OUTPUT_LIMIT` **was** added to the enum, in
`prisma/migrations/20260821090000_execution_output_limit`. A print left inside a
loop is a common, specific and teachable mistake; reporting it as a runtime
error sends the learner looking for a crash that is not there. The migration is
additive — one new enum value, no row rewritten.

---

## Run and Submit

Unchanged by this phase, and worth restating because the executor must not
alter it:

| | Run | Submit |
| --- | --- | --- |
| Test cases | Visible only | Visible **and** hidden |
| Submission row | Created, `kind = RUN` | Created, `kind = SUBMIT` |
| Progress | Never touched | `ACCEPTED` → `SOLVED` with `solvedAt`; anything else → `ATTEMPTED` |
| `SYSTEM_ERROR` | No progress change | No progress change, no attempt counted |

The `where` clause in `runSubmission` is the only place hidden cases are read,
and `buildFeedback` is the only thing that decides what of a failure is shown:
a hidden case reports its position and the general shape of the mismatch, never
its input or its expected output.

---

## Inside the execution service

```
services/execution/src/
  index.ts        process: start, sweep, serve, shut down
  server.ts       two routes, bearer auth, body limits
  queue.ts        bounded concurrency; refuses rather than hangs
  execute.ts      harness -> sandbox -> compare -> verdict
  validate.ts     total request validation, hand-written
  compare.ts      answer comparison, mirroring scripts/verify-solutions.ts
  scrub.ts        message scrubbing, on this side of the boundary
  config.ts       every limit, with a value
  harness/        one LanguageRuntime per language
  sandbox/        the container boundary; docker.ts is today's implementation
runner/
  Dockerfile      the sandbox image
  runner.py       the in-container runner
  java/           the reflective Java harness, precompiled into the image
```

**No npm dependencies.** The service's whole job is to stand between hostile
input and a container runtime; every package it installed would be another
author with a commit bit on that boundary. Validation is hand-written, the HTTP
server is `node:http`, and the lockfile is empty.

### Language runtimes

Each runtime decides what files to write, whether there is a compile step, and
what command runs the result. Nothing else in the service branches on language.

| Language | Compile | Run |
| --- | --- | --- |
| JavaScript | `node --check` | `node --max-old-space-size=<limit>` |
| TypeScript | `esbuild` → CommonJS | as JavaScript |
| Python | `python3 -m py_compile` | `python3 -B -u` |
| Java | `javac` | `java -cp /work:/opt/cc/java -Xmx<limit>m` |
| C++ | `g++ -std=c++17 -O2` | the compiled binary |

JavaScript and Python have no compiler; they are syntax-checked anyway so that
a missing bracket is a `COMPILE_ERROR` rather than a crash on the first test
case. Those two failures need completely different advice.

TypeScript is **transpiled, not type-checked**, which is the convention
`scripts/verify-solutions.ts` already set. A syntax error is a
`COMPILE_ERROR`; a type error is erased and surfaces later as a runtime error
or a wrong answer.

### The harness

Return values go to `/work/results.jsonl`, one JSON object per case, never to
stdout. A learner debugging with `print` or `console.log` can leave it in: their
output is captured separately and cannot corrupt grading.

Arguments are copied per case — `structuredClone` in JavaScript,
`copy.deepcopy` in Python, fresh coercion in Java, fresh literals in C++ — so a
solution that sorts its input in place fails one case rather than every case
after it.

Binary trees cross the wire as `int?[]`, the level-order serialisation with
`null` for a missing child. The `TreeNode` type, `buildTree` and `serialiseTree`
are generated into the learner's starter code by `prisma/seed/problems/starter.ts`
and are therefore part of *their* source, not the harness's. The executor does
not know what a tree is, which is what keeps five languages agreeing about one.

### Runtime versions

Recorded in the image at build time rather than claimed here. Read them with:

```bash
docker run --rm --entrypoint cat codecompass-runner:1 /opt/cc/versions.txt
```

The image built from `services/execution/runner/Dockerfile` on
`node:20-bookworm-slim` currently reports:

```
v20.20.2          Node.js
Python 3.11.2
g++ 12.2.0
javac 17.0.20
esbuild 0.28.2
```

Image size is roughly 320MB. Rebuilding is how a runtime version changes;
nothing about a submission can change what is installed.

---

## Resource limits

Every limit has a value and none of them is optional — a limit that defaults to
"unset" is a limit that is off the first time somebody forgets a variable. All
are overridable by environment variable; the names are in
`services/execution/src/config.ts`.

### Per execution

| Limit | Default | Enforced by |
| --- | --- | --- |
| CPU | 1.0 core | `--cpus`, a quota rather than a share |
| Memory | problem limit + runtime floor | `--memory` with `--memory-swap` equal, so swap is off |
| Wall clock | `timeLimitMs` × test count + start-up grace | the in-container runner, then container removal |
| Compile wall clock | 20s, never charged to the learner | the in-container runner |
| Processes and threads | 96 | `--pids-limit` |
| stdout + stderr | 256KB | the runner, which kills the process group on exceeding it |
| Results file | 512KB | the runner |
| Disk | 64MB `/work`, 16MB `/tmp` | sized `tmpfs`; there is no other writable path |
| Single file | 32MB | `--ulimit fsize` |
| Open files | 256 | `--ulimit nofile` |
| Source size | 64KB | the application, then the service again |
| Test cases | 64, each ≤64KB | the service |

The **wall clock is per case, multiplied**, not per batch. `timeLimitMs` is
authored per problem and means one run of the program — it is the number the
problem page shows and the number the timeout feedback quotes. A batch runs
every case in one process, so it gets the per-case limit times the number of
cases. Doing it the other way would mean a problem with nine cases silently had
a ninth of the limit it advertises.

Runtime floors and start-up grace, from `RUNTIME_OVERHEAD`:

| Language | Extra memory | Start-up grace |
| --- | --- | --- |
| JavaScript / TypeScript | 96MB | 400ms |
| Python | 48MB | 300ms |
| Java | 256MB | 1200ms |
| C++ | 16MB | 100ms |

A JVM told to live in 128MB does not run a slow program, it fails to start, and
reporting that as "your solution used too much memory" would be a lie told to
every Java learner. So the container gets the problem's limit plus the runtime's
floor, the runtime is told to cap its own heap at the problem's limit, and the
verdict comes from the runtime hitting that cap.

The catalog authors `timeLimitMs` as 2000 (or 5000 for a handful) and
`memoryLimitMb` as 128 throughout.

### Per service

| | Default |
| --- | --- |
| Concurrent executions | 4 |
| Queue depth | 32 |
| Longest queue wait | 10s, then `429` |

Over the queue ceiling the service answers `429` with `Retry-After`, which the
application turns into `SYSTEM_ERROR` — "temporarily unavailable", no attempt
recorded. A service that accepts everything and lets it time out looks healthy
from the outside while being useless.

### Per learner

`EXECUTION_LIMITS.maxRunsPerWindow` — 60 runs an hour, counted from submission
rows in a rolling window so it is correct across restarts and instances, and
enforced in `startSubmission` **before** a row is created.

---

## The security model

### What is enforced

| Control | How |
| --- | --- |
| No network | `--network none`. The namespace has no route out — not a firewall rule, so there is nothing to misconfigure or bypass |
| Non-root | `--user 65534:65534`, and the image's own `USER` as well |
| No capabilities | `--cap-drop ALL` |
| No privilege regain | `--security-opt no-new-privileges` |
| Immutable filesystem | `--read-only`, with `tmpfs` at `/work` (`nosuid,nodev`) and `/tmp` (`nosuid,nodev,noexec`) |
| No secrets | The container's environment is built from a fixed list — `HOME`, `PATH`, `TZ`, `LANG`, `LC_ALL`, and two Python determinism flags. Docker does not copy the daemon's environment, so `DATABASE_URL`, `AUTH_SECRET`, the GitHub token and the service's own `EXECUTION_TOKEN` were never in the process |
| No Docker socket | Never mounted into a sandbox. The supervisor has it; the thing it supervises does not |
| Process tree termination | Container removal ends every process inside it, whatever was forked |
| Seccomp | Docker's default profile, which already refuses `mount`, `kexec_load`, the `*_module` calls and much else. `EXECUTION_SECCOMP_PROFILE` points at a narrower one |
| Determinism | `TZ=UTC`, `LANG=C.UTF-8`, `PYTHONHASHSEED=0`, a fixed working directory and fixed file names |
| No package installation | There is no network to install from. `npm install`, `pip install` and `apt-get` fail because nothing is reachable, not because a rule forbids them |

### Two timeouts, not one

The runner inside the container enforces the learner's time limit precisely, and
that is where a `TIME_LIMIT` verdict normally comes from. But the runner runs as
the same unprivileged user as the program it supervises, so a determined
submission can interfere with it.

The supervisor therefore keeps its own outer clock and, when it fires, removes
the container. That path does not need the runner to be trustworthy. An outer
timeout is logged as `sandbox.outer_timeout`, because the inner limit failing to
fire is a bug in the runner rather than in the solution.

### Cleanup

`docker run --rm` removes the container on every exit. A container whose
supervisor died is caught by the orphan sweep, which runs at start-up, on
shutdown, and every 60 seconds — and which skips containers this process is
currently supervising, because it would otherwise kill live executions.

### What is *not* claimed

**This is a container, not a hypervisor.** A kernel exploit reachable from a
seccomp-filtered, capability-free, non-root process would defeat it, as it would
defeat any container-based judge. Nothing here has been tested against a kernel
escape and nothing here should be described as escape-proof. A deployment that
needs a stronger guarantee should run the runner under gVisor, Kata, or a
Firecracker micro-VM — all of which are a new file under `sandbox/` and no
change anywhere else.

**Anti-cheat is out of scope.** A learner can hard-code expected answers. So can
they on every judge; the invariant this design protects is that a submission
cannot reach the application server or another learner's data, not that a
submission is honest.

**The supervisor's Docker socket access is real.** Access to the daemon socket
is equivalent to root on the host. The supervisor needs it, runs no submitted
code, and is the component whose job is to be allowed to do this — but see
*Deployment* below, because how it gets that access is a decision with a blast
radius.

### What was actually tested

`tests/execution-sandbox.test.ts`, run against a live service and a real
container runtime. Every one of these is written so that the probe *tries* the
hostile thing and returns what happened, and the case expects the string meaning
it was refused — so a sandbox that stopped isolating would come back
`WRONG_ANSWER` showing exactly what it managed to do, not silently pass.

| Attempt | Result |
| --- | --- |
| Outbound TCP to `1.1.1.1:80` | Refused |
| DNS resolution | Refused |
| Connect to Postgres (5432, 5433), Redis (6379), the execution API (8080), `host.docker.internal` | All refused |
| Connect to `169.254.169.254` (cloud metadata) | Refused |
| Enumerate environment for anything matching DATABASE/SECRET/TOKEN/AUTH/PASSWORD/KEY/GITHUB/OPENAI/ANTHROPIC/NEXTAUTH | Nothing |
| Enumerate the whole environment | Only the fixed list above, plus `HOSTNAME`, `PWD`, `SHLVL` and the base image's `NODE_VERSION` |
| Stat `/var/run/docker.sock`, `/app`, `/app/.env`, `/PROJECT`, `/host`, `/mnt/c`, `/etc/kubernetes`, `/root/.ssh` | None exist |
| Write to `/etc`, `/usr/bin`, `/opt/cc`, `/` | All refused |
| Append to `/opt/cc/runner.py` | Read-only |
| `os.getuid()` | 65534 |
| `os.setuid(0)` | Refused |
| `fork()` until failure | Contained; the service graded the next submission immediately after |
| Background a `sleep 600` and return | Container removed with the process |
| Write 4GB into `/work` | Stopped by the tmpfs size |
| `while True: pass` | `TIME_LIMIT` |
| `while True: print(...)` | `OUTPUT_LIMIT` |
| Allocate until refused | `MEMORY_LIMIT` |
| Syntax error, all five languages | `COMPILE_ERROR`, no case reported as run |
| Crash mid-batch | `RUNTIME_ERROR`, with the cases already answered still graded |
| Runtime message containing `/work/main.py` | Arrives as "your code", with no path |
| Request with no token, or the wrong token | `401` |
| Malformed request | `400` |

Not covered, and not claimed: container escape, kernel exploitation, side
channels between concurrent sandboxes, and anything about a runtime version
other than the ones listed above.

---

## Local development

Nothing below is needed to work on the rest of CodeCompass. `npm run dev` with
`CODE_EXECUTION_PROVIDER=mock` needs no Docker at all, and the practice UI, the
submission lifecycle and the progress rules all work against simulated verdicts.

To run real execution locally:

```bash
npm run exec:build
```

```bash
npx tsc -p services/execution/tsconfig.json
```

```bash
EXECUTION_TOKEN=dev-secret PORT=8080 node services/execution/dist/index.js
```

Then point the application at it:

```
CODE_EXECUTION_PROVIDER="sandbox"
CODE_EXECUTION_URL="http://127.0.0.1:8080/v1/execute"
CODE_EXECUTION_TOKEN="dev-secret"
```

Check it without running anything:

```bash
npm run exec:health
```

Send the catalog's own reference solutions through it:

```bash
npx tsx scripts/execution-probe.ts --url http://127.0.0.1:8080/v1/execute --token dev-secret --slug find-maximum
```

Omitting `--slug` sends all 300 problems in every language they are authored in
— 1450 executions, a few minutes at the default concurrency. A failure there is
a failure of the executor, not of the answer key: `scripts/verify-solutions.ts`
has already checked those solutions against those same cases.

---

## Testing

| Suite | Needs | Runs in CI |
| --- | --- | --- |
| `tests/practice.test.ts` | Postgres | Yes |
| `tests/execution.test.ts` | Postgres | Yes |
| `tests/execution-sandbox.test.ts` | A running service and a container runtime | **No — skips itself** |

`tests/execution.test.ts` replaces the sandbox at its own interface, which is
the same seam the service uses to swap container technology. Harness generation,
verdict mapping, comparison, the queue, message scrubbing, provider selection
and request validation are all exercised without a container.

`tests/execution-sandbox.test.ts` skips unless `EXECUTION_SANDBOX_URL` is set:

```bash
EXECUTION_SANDBOX_URL=http://127.0.0.1:8080/v1/execute EXECUTION_SANDBOX_TOKEN=dev-secret npx vitest run tests/execution-sandbox.test.ts
```

Skipping rather than failing keeps CI able to run the 300-problem suite on a
machine with no Docker. What that costs is honesty about coverage, so: **a green
`npm test` has not checked any of the isolation guarantees.** Running that file
against the service a deployment will actually use is part of shipping it.

---

## Deployment

The application deploys unchanged. The execution service does not deploy to
Vercel — it needs a container runtime, which a serverless function does not
have.

```
Vercel / Next.js
      │  HTTPS, bearer token, private network
      ▼
Execution service        one VM or one container host
      │  container runtime socket
      ▼
Throwaway containers     one per submission
```

### Where the supervisor runs

**On the host, under systemd (preferred).** The service is a Node process with
no dependencies; give it the socket through normal group membership and never
put the supervisor in a container. Smallest blast radius.

**In a container, with the socket mounted.** `services/execution/Dockerfile`
supports this, and its header says plainly what it costs: mounting
`/var/run/docker.sock` means that compromising the supervisor compromises the
host. The sandbox never gets that socket either way.

### Network placement

The service must sit where a sandbox could not reach anything even if isolation
failed: its own segment, no route to the application database, no route to
Redis, no cloud instance role worth stealing. `--network none` already means a
sandbox has no route anywhere; this is the second wall.

### Scaling

`EXECUTION_MAX_CONCURRENT` is the capacity story, and it is roughly
(cores − 1) at `EXECUTION_CPUS=1.0`. More throughput means more service
instances behind a load balancer, each with its own container host. Nothing in
the service keeps state between requests, so instances need not know about each
other.

### Health

`GET /health` — `200` when the runner image is present and the runtime answers,
`503` otherwise, with queue depth in the body either way. Suitable for a load
balancer, an uptime check, and the container `HEALTHCHECK`, all of which are
already wired.

---

## Failure handling

If the service is unavailable, the practice page still loads, the editor still
works, and nothing a learner typed is lost. Run and Submit return
`SYSTEM_ERROR`, which the UI renders as *"Code execution is temporarily
unavailable"*, and which records **no attempt and no progress change**. An
infrastructure failure is never a wrong answer.

If nothing is configured at all, `supportedLanguages()` is empty, the buttons
are disabled from the server render, and the page says why rather than offering
a button that lies.

---

## Observability

One JSON object per line on stdout, from `services/execution/src/log.ts`.

Logged: `executionId`, language, entry point, test count, verdict, wire status,
passed count, duration, peak memory, queue wait, container name, and an error
category.

**Not logged: the submitted source, ever.** Not truncated — excluded. A
learner's solution is their work, and an attacker's payload is evidence that
would otherwise sit in a log aggregator for ninety days. Test-case inputs,
expected outputs and the bearer token are excluded for the same reason.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Every submission is `SYSTEM_ERROR` | Image missing or daemon down | `GET /health`; `npm run exec:build` |
| `startup.no_token` in the log, everything `401` | `EXECUTION_TOKEN` unset | Set it. An unset token refuses everything rather than allowing everything |
| Run and Submit disabled in the UI | `CODE_EXECUTION_PROVIDER` unset, or set to `sandbox` with no URL | Check the application's environment; `npm run exec:health` |
| Amber "results are simulated" banner | The mock provider | Expected in development; refused in production |
| `429` under load | Queue full | Raise `EXECUTION_MAX_CONCURRENT` if the host has the cores, or add an instance |
| `sandbox.outer_timeout` in the log | The in-container limit did not fire | A runner bug. The learner still got a correct `TIME_LIMIT` |
| Java submissions fail to start | Container memory below the JVM's floor | `RUNTIME_OVERHEAD.JAVA`, not the problem's limit |

---

## Known limitations

- **Container isolation only.** See *What is not claimed* above.
- **The sandbox tests do not run in CI**, because CI has no Docker. They must be
  run against the service a deployment will use.
- **TypeScript is transpiled, not type-checked.** A type error is erased and
  surfaces as a runtime error or a wrong answer.
- **Argument mutation is still not graded.** Grading compares what a function
  returned; the sandbox does not snapshot inputs around the call, so a solution
  that edits its argument in place and returns it passes. Problems that teach
  immutability say so, and their reference solutions model it, but that is an
  answer-key guarantee and not learner mutation detection. Closing it means
  teaching the harness to snapshot and report mutation as part of the outcome —
  a change to this service and its wire format, not to the application.
- **Python's recursion limit is the interpreter default.** A deeply skewed tree
  beyond roughly a thousand levels would raise `RecursionError` where the same
  algorithm succeeds in Java, which runs its work on a 256MB stack. No case in
  the catalog is near that.
- **Peak memory is the whole process's**, including the runtime's own footprint,
  so a Node submission reports around 37MB before it allocates anything.
- **No custom test input.** "Run against my own case" is not built.
- **One image for all five languages.** Simple, and about 320MB. Splitting it
  per language would cut cold-start pull time at the cost of five images to keep
  in step.
