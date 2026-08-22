# CodeCompass execution service

Runs untrusted learner submissions in a throwaway container and returns a
verdict. A separate deployable from the Next.js application, with no npm
dependencies.

**The reference documentation is [`docs/code-execution.md`](../../docs/code-execution.md)**
in the repository root — architecture, the wire contract, every resource limit,
the security model and what was actually tested against it, deployment, and the
known limitations. This file is the short version for someone standing in this
directory.

## Two images, and the difference matters

| | Built from | What it is |
| --- | --- | --- |
| `codecompass-runner` | `runner/Dockerfile` | **The sandbox.** What a submission sees. No network, no secrets, read-only, non-root |
| the service | `Dockerfile` | **The supervisor.** Holds the queue, drives the container runtime, grades results. Runs no submitted code |

The supervisor needs access to a container runtime. The sandbox must never have
it. Do not merge these.

## Run it locally

```bash
docker build -t codecompass-runner:1 runner
```

```bash
npx tsc -p tsconfig.json && EXECUTION_TOKEN=dev-secret node dist/index.js
```

```bash
curl -s http://127.0.0.1:8080/health
```

## Routes

- `POST /v1/execute` — grade one submission. `Authorization: Bearer <token>`.
- `GET /health` — `200` or `503`. Runs nothing.

An unset `EXECUTION_TOKEN` refuses every request rather than allowing every
request: a deployment that forgot to configure it should be visibly broken, not
quietly open to anyone who can reach the port.

## Configuration

Every limit has a default and every default is a real value — see
`src/config.ts`, which is the single place they live. The ones most worth
knowing:

| Variable | Default |
| --- | --- |
| `PORT` | `8080` |
| `EXECUTION_TOKEN` | *(unset — refuses everything)* |
| `EXECUTION_IMAGE` | `codecompass-runner:1` |
| `EXECUTION_MAX_CONCURRENT` | `4` |
| `EXECUTION_MAX_QUEUED` | `32` |
| `EXECUTION_PIDS_LIMIT` | `96` |
| `EXECUTION_CPUS` | `1.0` |
| `EXECUTION_MAX_OUTPUT_BYTES` | `262144` |
| `EXECUTION_WORK_TMPFS_MB` | `64` |
| `EXECUTION_SECCOMP_PROFILE` | *(unset — Docker's default profile)* |

## Adding a language

One file under `src/harness/` implementing `LanguageRuntime`, one line in
`src/harness/index.ts`, and the toolchain in `runner/Dockerfile`. Nothing else
in the service branches on language, and the application does not have to know.
