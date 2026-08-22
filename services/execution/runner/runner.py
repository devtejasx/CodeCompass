#!/usr/bin/env python3
"""The in-container runner.

This is the only thing in the sandbox that CodeCompass wrote and intends to run.
It reads a payload on stdin, writes the learner's files into the work directory,
compiles if the language needs it, runs the program under a wall clock and an
output cap, and prints one JSON report on stdout.

Three things about its position are worth being explicit about, because they
decide what it is allowed to be trusted with.

It runs as the same unprivileged user as the program it supervises. It is
therefore *not* a security boundary - the container is. A submission that
manages to kill this script or corrupt its output cannot escape anything; it can
only make the report unreadable, and the service treats an unreadable report as
its own failure rather than as a passing grade. The outer wall clock in
sandbox/docker.ts exists for exactly that case and does not depend on this file
behaving.

It is what makes the limits *precise*. The container's memory cap and pid limit
are enforced by the kernel whatever happens here; the time limit and the output
limit are enforced here so that the verdict can say which one was hit, and so
that the learner's limit is not confused with the compiler's.

It never sees a test case's expected answer. The payload carries source files
and commands. Grading happens in the service, from values this script copies out
of a file the harness wrote.
"""

import json
import os
import selectors
import signal
import subprocess
import sys
import time

WORK = "/work"
RESULTS = os.path.join(WORK, "results.jsonl")

# Per stream, so a program that writes only to stderr still has its message
# kept. The payload's outputLimitBytes governs the *combined* total and is what
# decides the verdict; this only bounds what is carried back in the report.
KEEP_PER_STREAM = 16 * 1024


def report(stage, **fields):
    """Prints the one line the service reads, and stops."""
    payload = {
        "stage": stage,
        "exit": None,
        "signal": None,
        "timedOut": False,
        "outputLimit": False,
        "durationMs": 0,
        "maxRssKb": None,
        "oom": False,
        "stderr": "",
        "stdout": "",
        "results": [],
    }
    payload.update(fields)
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()
    sys.exit(0)


def oom_count():
    """How many times this cgroup has been OOM-killed, if it will say.

    cgroup v2 first, then v1. A kernel that offers neither is not a failure: the
    service falls back to reading SIGKILL-with-no-other-explanation as the
    memory limit, which is the same conclusion by a slower route.
    """
    try:
        with open("/sys/fs/cgroup/memory.events", "r") as handle:
            for line in handle:
                if line.startswith("oom_kill "):
                    return int(line.split()[1])
    except OSError:
        pass
    try:
        with open("/sys/fs/cgroup/memory/memory.failcnt", "r") as handle:
            return int(handle.read().strip())
    except OSError:
        pass
    return None


def kill_tree(pid):
    """Ends the process group, not just the process.

    The child is started in a session of its own, so its group id is its pid and
    everything it forked inherits that group. Killing the group is what stops a
    program that spawned helpers and exited, leaving them holding the pipes.
    """
    try:
        os.killpg(os.getpgid(pid), signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def wait_for(pid):
    """Reaps one child and reports its own peak memory.

    os.wait4 rather than Popen.wait because it returns the rusage of *this*
    child. getrusage(RUSAGE_CHILDREN) aggregates every child the runner has
    waited for, which would report the compiler's peak as the program's on every
    compiled language.
    """
    _, status, usage = os.wait4(pid, 0)
    if os.WIFSIGNALED(status):
        return None, os.WTERMSIG(status), usage.ru_maxrss
    return os.WEXITSTATUS(status), None, usage.ru_maxrss


def run(argv, timeout_ms, output_limit):
    """Runs one command under a wall clock and an output cap."""
    started = time.monotonic()
    oom_before = oom_count()

    try:
        proc = subprocess.Popen(
            argv,
            cwd=WORK,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            # Its own session, so kill_tree can take the whole group.
            start_new_session=True,
            close_fds=True,
        )
    except OSError as error:
        return {
            "spawn_failed": True,
            "detail": str(error),
            "stdout": "",
            "stderr": "",
            "exit": None,
            "signal": None,
            "timedOut": False,
            "outputLimit": False,
            "durationMs": 0,
            "maxRssKb": None,
            "oom": False,
        }

    selector = selectors.DefaultSelector()
    selector.register(proc.stdout, selectors.EVENT_READ, "out")
    selector.register(proc.stderr, selectors.EVENT_READ, "err")

    kept = {"out": bytearray(), "err": bytearray()}
    total = 0
    timed_out = False
    over_limit = False
    deadline = started + (timeout_ms / 1000.0)
    open_streams = 2

    while open_streams > 0:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            timed_out = True
            break

        for key, _ in selector.select(timeout=min(remaining, 0.2)):
            chunk = key.fileobj.read1(65536)
            if not chunk:
                selector.unregister(key.fileobj)
                key.fileobj.close()
                open_streams -= 1
                continue

            total += len(chunk)
            buffer = kept[key.data]
            if len(buffer) < KEEP_PER_STREAM:
                buffer.extend(chunk[: KEEP_PER_STREAM - len(buffer)])

            if total > output_limit:
                over_limit = True
                break

        if over_limit:
            break

    if timed_out or over_limit:
        kill_tree(proc.pid)

    # Everything still open is drained rather than left, because a pipe with an
    # unread buffer keeps the writer alive and would turn a kill into a hang.
    for key in list(selector.get_map().values()):
        try:
            selector.unregister(key.fileobj)
            key.fileobj.close()
        except (OSError, KeyError):
            pass
    selector.close()

    code, killed_by, max_rss = wait_for(proc.pid)
    # Popen must not try to reap a child os.wait4 already collected.
    proc.returncode = code if code is not None else -(killed_by or 0)

    oom_after = oom_count()
    oom = (
        oom_before is not None
        and oom_after is not None
        and oom_after > oom_before
    )

    return {
        "spawn_failed": False,
        "detail": "",
        "stdout": kept["out"].decode("utf-8", "replace"),
        "stderr": kept["err"].decode("utf-8", "replace"),
        "exit": code,
        "signal": killed_by,
        "timedOut": timed_out,
        "outputLimit": over_limit,
        "durationMs": int((time.monotonic() - started) * 1000),
        "maxRssKb": max_rss,
        "oom": oom,
    }


def read_results(limit_bytes):
    """Copies out what the harness recorded, up to a ceiling.

    A truncated read is a partial answer, not an error: the cases that made it
    into the file are graded, and the ones that did not are failures because the
    service has nothing from them. That is the same treatment a program that
    crashed half way gets, which is what it deserves.
    """
    try:
        size = os.path.getsize(RESULTS)
    except OSError:
        return []
    if size > limit_bytes:
        return []

    lines = []
    try:
        with open(RESULTS, "r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    lines.append(line)
    except OSError:
        return []
    return lines


def main():
    try:
        payload = json.loads(sys.stdin.read())
    except (ValueError, OSError) as error:
        report("setup", stderr="unreadable payload: %s" % error)

    output_limit = int(payload.get("outputLimitBytes", 256 * 1024))
    result_limit = int(payload.get("resultLimitBytes", 512 * 1024))

    # ── Materialise the submission ────────────────────────────────────────
    try:
        for name, contents in payload["files"].items():
            # The service builds these names; the check is here because a path
            # traversal in a file name would write outside the work directory,
            # and a assertion in the place that opens the file is worth more
            # than one in the place that trusts itself.
            if "/" in name or name in ("", ".", ".."):
                report("setup", stderr="rejected file name")
            with open(os.path.join(WORK, name), "w", encoding="utf-8") as handle:
                handle.write(contents)
    except (OSError, KeyError, AttributeError) as error:
        report("setup", stderr="could not write submission: %s" % error)

    # ── Compile ───────────────────────────────────────────────────────────
    compile_argv = payload.get("compile")
    if compile_argv:
        compiled = run(
            compile_argv,
            int(payload.get("compileTimeoutMs", 20000)),
            output_limit,
        )
        if compiled["spawn_failed"]:
            report("setup", stderr="compiler unavailable: %s" % compiled["detail"])
        if compiled["exit"] != 0 or compiled["timedOut"]:
            report(
                "compile",
                exit=compiled["exit"],
                signal=compiled["signal"],
                timedOut=compiled["timedOut"],
                outputLimit=compiled["outputLimit"],
                durationMs=compiled["durationMs"],
                # A compiler writes its complaint to stderr and its progress to
                # stdout, so stderr first and stdout only if there is nothing.
                stderr=compiled["stderr"] or compiled["stdout"],
            )

    # ── Run ───────────────────────────────────────────────────────────────
    executed = run(payload["run"], int(payload.get("wallClockMs", 5000)), output_limit)
    if executed["spawn_failed"]:
        report("setup", stderr="runtime unavailable: %s" % executed["detail"])

    report(
        "run",
        exit=executed["exit"],
        signal=executed["signal"],
        timedOut=executed["timedOut"],
        outputLimit=executed["outputLimit"],
        durationMs=executed["durationMs"],
        maxRssKb=executed["maxRssKb"],
        oom=executed["oom"],
        stderr=executed["stderr"],
        stdout=executed["stdout"],
        results=read_results(result_limit),
    )


if __name__ == "__main__":
    main()
