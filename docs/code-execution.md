# Code execution

> **Status: production code execution is NOT implemented.**
> CodeCompass ships with a development provider that returns deterministic,
> clearly-labelled **simulated** verdicts. It does not run code. A real
> sandboxed execution service — described below — must be built and configured
> before this feature is put in front of real learners.

---

## The rule

**CodeCompass never executes learner code in the application process.**

No file in this repository may use `eval`, `new Function`, `node:vm`,
`child_process.exec`, `child_process.spawn`, `worker_threads`, a database
language handler, or any equivalent, to run a submission. Learner code is
hostile input. It is handed across a network boundary to something whose entire
job is to contain it, and the only thing that comes back is a verdict.

```
Browser  →  Next.js server action  →  CodeExecutionService  →  HTTP
                                                                ↓
                                            Execution service (separate deploy)
                                                                ↓
                                                     Isolated sandbox per run
                                                                ↓
                                          Verdict  →  sanitised  →  Postgres
```

`src/lib/practice/execution/` holds the whole boundary:

| File | Role |
| --- | --- |
| `types.ts` | `CodeExecutionService`, request/result shapes, hard limits |
| `index.ts` | Provider selection from the environment |
| `http-provider.ts` | Production path — talks to the external service |
| `mock-provider.ts` | Development only — simulates, never executes |
| `sanitise.ts` | Scrubs paths, URLs, addresses and ids out of every message |

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
   `wrong`, `timeout`, `memory`, `compile-error`, `runtime-error`,
   `system-error`. This is how the test suite and a developer exercise every
   result state without a compiler.
2. Source still identical to the starter code fails with nothing passed.
3. Source matching the authored reference solution is accepted.
4. Anything else fails and says plainly that the development provider cannot
   grade arbitrary code.

Every result carries `simulated: true`; the workspace shows a permanent amber
banner and the result panel repeats it. **Requesting `mock` while
`NODE_ENV=production` is refused** and the application falls back to `none`.

### `http` — production

Posts to `CODE_EXECUTION_URL`, with `Authorization: Bearer
$CODE_EXECUTION_TOKEN` when a token is set. The request is bounded by an
`AbortController` at 20 seconds. The response is validated against a schema, and
outcomes are re-keyed against *our* test list — a response that invents or omits
cases cannot change how many tests a learner is graded on.

`CODE_EXECUTION_LANGUAGES` narrows the offered languages by intersection; an
unknown name in it is ignored rather than added.

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
  "code": "def find_maximum(numbers: list[int]) -> int:\n    ...",
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
The service's harness deserialises the arguments, calls `entryPoint` with them
spread as parameters, serialises the return value as JSON, and compares. Because
the contract is JSON on both sides, one authored test case runs unchanged in
every language.

The reference solution is **never** part of this payload. `http-provider.ts`
builds the body field by field precisely so it cannot ride along.

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
| `status` | One of `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT`, `MEMORY_LIMIT`, `COMPILE_ERROR`, `RUNTIME_ERROR`, `SYSTEM_ERROR` |
| `executionTime` | Wall-clock milliseconds, or `null` |
| `memoryUsed` | Peak kilobytes, or `null` |
| `message` | Compiler or runtime text. Scrubbed again on our side; scrub it on yours too |
| `outcomes` | One entry per test `order`. Extra or missing entries are ignored/treated as failures |

The service must **not** return hidden test inputs or expected outputs in
`message` or `actualOutput`. The application withholds hidden-case detail
regardless, but defence in depth applies.

---

## What the sandbox must guarantee

Every one of these is required before `http` is enabled in production.

**Isolation**

- One fresh container (or micro-VM) per submission. No reuse between runs.
- Non-root user, no `sudo`, no setuid binaries.
- Unprivileged: no `--privileged`, no added capabilities, `--cap-drop=ALL`.
- `--security-opt no-new-privileges`, and a seccomp profile that blocks at
  minimum `ptrace`, `mount`, `kexec_load` and the `*_module` calls.
- Read-only root filesystem, with a single small `tmpfs` for the work directory.

**Resources**

- CPU quota (e.g. `--cpus=0.5`) *and* a wall-clock kill at the request's
  `timeLimitMs`. A CPU quota alone does not stop a sleeping process.
- Memory cap at `memoryLimitMb`, with swap disabled, so exceeding it is an
  OOM kill rather than thrashing.
- Process/thread cap (`--pids-limit`), so a fork bomb dies immediately.
- Output cap — truncate captured stdout/stderr at a fixed size and stop reading.
- Input cap — reject a request whose `code` exceeds 64KB before scheduling it.
- File-size and file-count limits inside the work directory.

**Network**

- `--network=none`. No DNS, no egress, no metadata endpoint, no loopback to
  anything of ours.

**Secrets and blast radius**

- No environment variables from the host reach the sandbox.
- No database credentials, no application secrets, no cloud instance role.
- The service runs in its own network segment and cannot reach the application
  database or any internal service.
- The token in `CODE_EXECUTION_TOKEN` authenticates the *application to the
  service*, and is never present inside a sandbox.

**Lifecycle**

- Guaranteed teardown: the container is destroyed on completion, timeout and
  crash alike, by a supervisor that does not itself run user code.
- Orphan sweeper for containers whose supervisor died.
- Per-user concurrency and rate limits, so one learner cannot occupy the pool.

---

## Verifying an implementation

Before enabling `http` in production, confirm each of these returns a contained
failure rather than a success:

| Attempt | Expected |
| --- | --- |
| Infinite loop | `TIME_LIMIT`, container gone |
| Allocate 2GB | `MEMORY_LIMIT`, OOM kill, host unaffected |
| `fork()` bomb | Killed by the pid limit |
| Print 1GB to stdout | Truncated, no memory growth in the supervisor |
| Read `/etc/passwd`, `/proc/self/environ` | Nothing sensitive; ideally denied |
| Write outside the work directory | Denied by the read-only root |
| Open a socket to any host | Fails — no network |
| Read environment variables | Empty of anything belonging to the application |
| Connect to the application database | Fails — unreachable and no credentials |
| Spawn a shell / run a package manager | Denied |
| Return a message containing a host path | Arrives scrubbed to `<path>` |

The suite in `tests/practice.test.ts` covers the application half of this: input
size limits, message scrubbing, hidden-case withholding, ownership, and that the
reference solution is not forwarded to the HTTP provider. It cannot verify a
sandbox that does not exist yet — that testing belongs with the service.

---

## Deferred

Not built in Phase 6, and not needed for it:

- A queue and workers. Submissions currently run through the request that
  created them, bounded by the service timeout; the `QUEUED`/`RUNNING` states
  and the polling client are already in place, so moving to a real queue is a
  change behind `CodeExecutionService` and nothing above it moves.
- Per-user rate limiting in the application (the service should have its own).
- Custom test input from the learner ("run against my own case").
