import type {
  SimCommit,
  SimFile,
  SimOutputLine,
  SimResult,
  SimState,
} from "./types";

/**
 * The simulator's reducer.
 *
 * `run(state, command)` returns a new state and some output. It never mutates
 * the state it is given, never touches a filesystem, and never executes
 * anything — a typed command is parsed into a small union and handled by a
 * switch. That is the whole security story, and it is why this file is safe to
 * drive from a text input.
 *
 * Where the model is deliberately simpler than Git, a comment says so. Teaching
 * a correct-but-partial model is the goal; teaching a wrong one would be worse
 * than teaching nothing.
 */

// ── Helpers ────────────────────────────────────────────────────────────────

const line = (text: string, tone: SimOutputLine["tone"] = "normal") => ({
  text,
  tone,
});

/**
 * Deterministic short SHA.
 *
 * Real Git hashes content; this hashes the commit's position and message. It
 * looks like a SHA and is stable across runs, which is what a learner needs and
 * what makes the exercises testable.
 */
function shortSha(seed: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0").slice(0, 7);
}

function clone(state: SimState): SimState {
  return {
    ...state,
    files: state.files.map((file) => ({ ...file })),
    staged: [...state.staged],
    commits: state.commits.map((commit) => ({
      ...commit,
      parents: [...commit.parents],
      snapshot: { ...commit.snapshot },
    })),
    branches: { ...state.branches },
    remotes: state.remotes.map((remote) => ({
      ...remote,
      commits: [...remote.commits],
      branches: { ...remote.branches },
    })),
    conflict: state.conflict ? { ...state.conflict } : null,
  };
}

function headCommit(state: SimState): SimCommit | null {
  const id = state.branches[state.head];
  return state.commits.find((commit) => commit.id === id) ?? null;
}

/** Commits reachable from a branch, newest first. */
export function history(state: SimState, branch = state.head): SimCommit[] {
  const byId = new Map(state.commits.map((commit) => [commit.id, commit]));
  const out: SimCommit[] = [];
  const seen = new Set<string>();
  const queue: string[] = [];

  const start = state.branches[branch];
  if (start) queue.push(start);

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    const commit = byId.get(id);
    if (!commit) continue;

    out.push(commit);
    queue.push(...commit.parents);
  }

  // Commits are created in order, so index order is chronological.
  return out.sort((a, b) => state.commits.indexOf(b) - state.commits.indexOf(a));
}

function requireRepo(state: SimState): SimOutputLine[] | null {
  if (state.initialized) return null;
  return [
    line("fatal: not a git repository (or any of the parent directories): .git", "error"),
    line("Run `git init` first — that is what creates the repository.", "hint"),
  ];
}

// ── Entry point ────────────────────────────────────────────────────────────

export function run(state: SimState, input: string): SimResult {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return { state, output: [], ok: true };

  const parts = trimmed.split(" ");

  // `edit` and `new` are not Git commands. They stand in for the thing a
  // learner would really do — change a file in their editor — which the
  // simulator otherwise has no way to represent. Without them the
  // modify → stage → commit loop cannot be demonstrated at all.
  if (parts[0] === "edit" || parts[0] === "new") {
    return doEdit(state, parts[0], parts.slice(1));
  }

  if (parts[0] !== "git") {
    return {
      state,
      output: [
        line(`${parts[0]}: command not found`, "error"),
        line("This simulator only understands git commands. Try `git help`.", "hint"),
      ],
      ok: false,
    };
  }

  const command = parts[1] ?? "";
  const args = parts.slice(2);

  switch (command) {
    case "init":
      return doInit(state);
    case "status":
      return doStatus(state);
    case "add":
      return doAdd(state, args);
    case "commit":
      return doCommit(state, trimmed);
    case "log":
      return doLog(state);
    case "diff":
      return doDiff(state, args);
    case "branch":
      return doBranch(state, args);
    case "switch":
      return doSwitch(state, args);
    case "checkout":
      return doCheckout(state, args);
    case "merge":
      return doMerge(state, args);
    case "remote":
      return doRemote(state, args);
    case "push":
      return doPush(state);
    case "pull":
      return doPull(state);
    case "fetch":
      return doFetch(state);
    case "help":
    case "":
      return doHelp(state);
    default:
      return {
        state,
        output: [
          line(`git: '${command}' is not a command this simulator models.`, "error"),
          line("`git help` lists everything it does understand.", "hint"),
        ],
        ok: false,
      };
  }
}

// ── Commands ───────────────────────────────────────────────────────────────

/**
 * Stands in for editing a file. Not Git — the working directory changing
 * underneath Git, which is where every Git story actually starts.
 */
function doEdit(state: SimState, verb: string, args: string[]): SimResult {
  const name = args[0];

  if (!name) {
    return {
      state,
      output: [
        line(`usage: ${verb} <filename>`, "error"),
        line("This stands in for changing a file in your editor.", "hint"),
      ],
      ok: false,
    };
  }

  const next = clone(state);
  const existing = next.files.find((entry) => entry.name === name);

  if (existing) {
    existing.content = `${existing.content} // edited`;
    existing.modified = true;
    // An edit after staging does not update what was staged — git add captured
    // a moment, and this is the clearest place to show that.
    return {
      state: next,
      output: [
        line(`Edited ${name}.`, "success"),
        next.staged.includes(name)
          ? line(
              `${name} was already staged. The staged copy is the version from when you ran git add — run git status and you will see it listed twice.`,
              "hint",
            )
          : line("Run `git status` to see how Git describes that change.", "hint"),
      ],
      ok: true,
    };
  }

  next.files.push({ name, content: `// ${name}`, tracked: false, modified: true });

  return {
    state: next,
    output: [
      line(`Created ${name}.`, "success"),
      line("Git can see it, but it is untracked until you add it.", "hint"),
    ],
    ok: true,
  };
}

function doInit(state: SimState): SimResult {
  if (state.initialized) {
    return {
      state,
      output: [line("Reinitialized existing Git repository in .git/", "muted")],
      ok: true,
    };
  }

  const next = clone(state);
  next.initialized = true;
  next.branches = { main: null };
  next.head = "main";

  return {
    state: next,
    output: [
      line("Initialized empty Git repository in /project/.git/", "success"),
      line("That hidden .git directory *is* the repository — the whole history lives there.", "hint"),
    ],
    ok: true,
  };
}

function doStatus(state: SimState): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const output: SimOutputLine[] = [line(`On branch ${state.head}`)];

  if (state.conflict) {
    output.push(
      line("You have unmerged paths.", "error"),
      line(`  both modified:   ${state.conflict.file}`, "error"),
      line('Fix the conflict, then run `git add <file>` and `git commit`.', "hint"),
    );
    return { state, output, ok: true };
  }

  const staged = state.staged;
  const modified = state.files.filter(
    (file) => file.tracked && file.modified && !staged.includes(file.name),
  );
  const untracked = state.files.filter(
    (file) => !file.tracked && !staged.includes(file.name),
  );

  if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
    output.push(line("nothing to commit, working tree clean", "muted"));
    return { state, output, ok: true };
  }

  if (staged.length > 0) {
    output.push(line("Changes to be committed:", "success"));
    for (const name of staged) output.push(line(`  new file:   ${name}`, "success"));
  }

  if (modified.length > 0) {
    output.push(line("Changes not staged for commit:", "warning"));
    for (const file of modified) output.push(line(`  modified:   ${file.name}`, "warning"));
  }

  if (untracked.length > 0) {
    output.push(line("Untracked files:", "error"));
    for (const file of untracked) output.push(line(`  ${file.name}`, "error"));
  }

  return { state, output, ok: true };
}

function doAdd(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  if (args.length === 0) {
    return {
      state,
      output: [
        line("Nothing specified, nothing added.", "error"),
        line("Try `git add <file>`, or `git add .` for everything.", "hint"),
      ],
      ok: false,
    };
  }

  const next = clone(state);
  const wantsAll = args.includes(".") || args.includes("-A") || args.includes("--all");

  const candidates = wantsAll
    ? next.files.filter((file) => !file.tracked || file.modified)
    : next.files.filter((file) => args.includes(file.name));

  const unknown = wantsAll
    ? []
    : args.filter((arg) => !next.files.some((file) => file.name === arg));

  if (unknown.length > 0) {
    return {
      state,
      output: unknown.map((name) =>
        line(`fatal: pathspec '${name}' did not match any files`, "error"),
      ),
      ok: false,
    };
  }

  for (const file of candidates) {
    if (!next.staged.includes(file.name)) next.staged.push(file.name);
  }

  const output = [
    line(
      candidates.length === 0
        ? "Nothing to add — no new or modified files."
        : `Staged ${candidates.length} file${candidates.length === 1 ? "" : "s"}.`,
      candidates.length === 0 ? "muted" : "success",
    ),
  ];

  if (wantsAll && candidates.length > 1) {
    output.push(
      line(
        "`git add .` stages everything Git can see. Run `git status` first and check what that includes.",
        "hint",
      ),
    );
  }

  return { state: next, output, ok: true };
}

function doCommit(state: SimState, raw: string): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const messageMatch = raw.match(/-m\s+"([^"]*)"|-m\s+'([^']*)'/);
  const message = messageMatch?.[1] ?? messageMatch?.[2] ?? "";

  if (state.conflict) {
    return {
      state,
      output: [
        line("error: you have unmerged paths.", "error"),
        line("Resolve the conflict and `git add` the file before committing.", "hint"),
      ],
      ok: false,
    };
  }

  if (state.staged.length === 0) {
    return {
      state,
      output: [
        line(`On branch ${state.head}`),
        line("nothing to commit — no changes are staged.", "error"),
        line("`git add` moves changes into the staging area first. That separation is the point.", "hint"),
      ],
      ok: false,
    };
  }

  if (!message) {
    return {
      state,
      output: [
        line("Aborting commit due to empty commit message.", "error"),
        line('Use `git commit -m "A message explaining why"`.', "hint"),
      ],
      ok: false,
    };
  }

  const next = clone(state);
  const parent = next.branches[next.head];
  const id = `c${next.commits.length + 1}`;

  const snapshot: Record<string, string> = {
    ...(headCommit(state)?.snapshot ?? {}),
  };
  for (const name of next.staged) {
    const file = next.files.find((entry) => entry.name === name);
    if (file) snapshot[name] = file.content;
  }

  const commit: SimCommit = {
    id,
    shortSha: shortSha(`${id}:${message}`),
    message,
    parents: parent ? [parent] : [],
    branch: next.head,
    snapshot,
  };

  next.commits.push(commit);
  next.branches[next.head] = id;

  for (const name of next.staged) {
    const file = next.files.find((entry) => entry.name === name);
    if (file) {
      file.tracked = true;
      file.modified = false;
    }
  }

  const count = next.staged.length;
  next.staged = [];

  return {
    state: next,
    output: [
      line(`[${next.head} ${commit.shortSha}] ${message}`, "success"),
      line(` ${count} file${count === 1 ? "" : "s"} changed`, "muted"),
      line("That change is now in the repository — the third of the three places.", "hint"),
    ],
    ok: true,
  };
}

function doLog(state: SimState): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const commits = history(state);

  if (commits.length === 0) {
    return {
      state,
      output: [
        line(`fatal: your current branch '${state.head}' does not have any commits yet`, "error"),
      ],
      ok: false,
    };
  }

  return {
    state,
    output: commits.map((commit) =>
      line(`${commit.shortSha}  ${commit.message}`, "normal"),
    ),
    ok: true,
  };
}

function doDiff(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const staged = args.includes("--staged") || args.includes("--cached");
  const head = headCommit(state);

  if (staged) {
    if (state.staged.length === 0) {
      return { state, output: [line("(no staged changes)", "muted")], ok: true };
    }

    const output: SimOutputLine[] = [];
    for (const name of state.staged) {
      const file = state.files.find((entry) => entry.name === name);
      if (!file) continue;
      const before = head?.snapshot[name];
      output.push(line(`diff --git a/${name} b/${name}`, "muted"));
      if (before !== undefined) output.push(line(`- ${before}`, "error"));
      output.push(line(`+ ${file.content}`, "success"));
    }
    return { state, output, ok: true };
  }

  const unstaged = state.files.filter(
    (file) => file.modified && !state.staged.includes(file.name),
  );

  if (unstaged.length === 0) {
    return {
      state,
      output: [
        line("(no unstaged changes)", "muted"),
        state.staged.length > 0
          ? line(
              "Everything is staged, so a bare `git diff` shows nothing. `git diff --staged` is what you want.",
              "hint",
            )
          : line("Nothing has changed since the last commit.", "muted"),
      ],
      ok: true,
    };
  }

  const output: SimOutputLine[] = [];
  for (const file of unstaged) {
    const before = head?.snapshot[file.name];
    output.push(line(`diff --git a/${file.name} b/${file.name}`, "muted"));
    if (before !== undefined) output.push(line(`- ${before}`, "error"));
    output.push(line(`+ ${file.content}`, "success"));
  }
  return { state, output, ok: true };
}

function doBranch(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const names = args.filter((arg) => !arg.startsWith("-"));

  if (names.length === 0) {
    return {
      state,
      output: Object.keys(state.branches).map((name) =>
        line(name === state.head ? `* ${name}` : `  ${name}`, name === state.head ? "success" : "normal"),
      ),
      ok: true,
    };
  }

  const name = names[0];
  if (state.branches[name] !== undefined) {
    return {
      state,
      output: [line(`fatal: a branch named '${name}' already exists`, "error")],
      ok: false,
    };
  }

  const next = clone(state);
  next.branches[name] = next.branches[next.head];

  return {
    state: next,
    output: [
      line(`Created branch ${name}.`, "success"),
      line("A branch is just a label pointing at a commit — nothing was copied.", "hint"),
    ],
    ok: true,
  };
}

function doSwitch(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const create = args.includes("-c") || args.includes("-C");
  const name = args.filter((arg) => !arg.startsWith("-"))[0];

  if (!name) {
    return {
      state,
      output: [line("fatal: missing branch name", "error")],
      ok: false,
    };
  }

  if (create) {
    if (state.branches[name] !== undefined) {
      return {
        state,
        output: [line(`fatal: a branch named '${name}' already exists`, "error")],
        ok: false,
      };
    }
    const next = clone(state);
    next.branches[name] = next.branches[next.head];
    next.head = name;
    return {
      state: next,
      output: [
        line(`Switched to a new branch '${name}'`, "success"),
        line("Work here cannot affect main until you merge it.", "hint"),
      ],
      ok: true,
    };
  }

  if (state.branches[name] === undefined) {
    return {
      state,
      output: [
        line(`fatal: invalid reference: ${name}`, "error"),
        line("`git branch` lists what exists. `git switch -c <name>` creates one.", "hint"),
      ],
      ok: false,
    };
  }

  const next = clone(state);
  next.head = name;
  return { state: next, output: [line(`Switched to branch '${name}'`, "success")], ok: true };
}

/** Kept because tutorials still use it — and it is a teaching moment. */
function doCheckout(state: SimState, args: string[]): SimResult {
  const result = args.includes("-b")
    ? doSwitch(state, ["-c", ...args.filter((arg) => arg !== "-b")])
    : doSwitch(state, args);

  return {
    ...result,
    output: [
      ...result.output,
      line(
        "`git checkout` still works, but it was split into `git switch` and `git restore` because one command doing both jobs destroyed a lot of work.",
        "hint",
      ),
    ],
  };
}

function doMerge(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  const name = args.filter((arg) => !arg.startsWith("-"))[0];

  if (!name || state.branches[name] === undefined) {
    return {
      state,
      output: [line(`merge: ${name ?? "(none)"} - not something we can merge`, "error")],
      ok: false,
    };
  }

  if (name === state.head) {
    return { state, output: [line("Already up to date.", "muted")], ok: true };
  }

  const next = clone(state);
  const target = next.branches[name];
  const current = next.branches[next.head];

  if (!target) {
    return { state, output: [line("Already up to date.", "muted")], ok: true };
  }

  // Fast-forward: the current branch has not moved since the other one split off.
  const currentHistory = current ? history(state, state.head).map((c) => c.id) : [];
  const targetHistory = history(state, name).map((c) => c.id);

  if (current && targetHistory.includes(current) === false && currentHistory.includes(target)) {
    return { state, output: [line("Already up to date.", "muted")], ok: true };
  }

  if (!current || targetHistory.includes(current)) {
    next.branches[next.head] = target;
    return {
      state: next,
      output: [
        line(`Updating ${current?.slice(0, 7) ?? "…"}..${target.slice(0, 7)}`, "muted"),
        line("Fast-forward", "success"),
        line("Nothing had to be reconciled, so no merge commit was created.", "hint"),
      ],
      ok: true,
    };
  }

  // A real merge. The model creates a merge commit rather than reconciling
  // content — the lesson here is the shape of the history, not the algorithm.
  const id = `c${next.commits.length + 1}`;
  const merge: SimCommit = {
    id,
    shortSha: shortSha(`${id}:merge:${name}`),
    message: `Merge branch '${name}' into ${next.head}`,
    parents: [current, target],
    branch: next.head,
    snapshot: {
      ...(next.commits.find((c) => c.id === current)?.snapshot ?? {}),
      ...(next.commits.find((c) => c.id === target)?.snapshot ?? {}),
    },
  };

  next.commits.push(merge);
  next.branches[next.head] = id;

  return {
    state: next,
    output: [
      line(`Merge made by the 'ort' strategy.`, "success"),
      line(`[${next.head} ${merge.shortSha}] ${merge.message}`, "muted"),
      line("Two parents: that is what makes this a merge commit.", "hint"),
    ],
    ok: true,
  };
}

function doRemote(state: SimState, args: string[]): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  if (args[0] === "add") {
    const [, name, url] = args;
    if (!name || !url) {
      return {
        state,
        output: [line("usage: git remote add <name> <url>", "error")],
        ok: false,
      };
    }
    const next = clone(state);
    next.remotes.push({ name, url, commits: [], branches: {} });
    return {
      state: next,
      output: [
        line(`Added remote '${name}'.`, "success"),
        line("'origin' is only a nickname for that URL — nothing about it is special.", "hint"),
      ],
      ok: true,
    };
  }

  if (state.remotes.length === 0) {
    return {
      state,
      output: [
        line("(no remotes)", "muted"),
        line("`git remote add origin <url>` connects this repository to a hosted copy.", "hint"),
      ],
      ok: true,
    };
  }

  return {
    state,
    output: state.remotes.flatMap((remote) => [
      line(`${remote.name}\t${remote.url} (fetch)`),
      line(`${remote.name}\t${remote.url} (push)`),
    ]),
    ok: true,
  };
}

function doPush(state: SimState): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  if (state.remotes.length === 0) {
    return {
      state,
      output: [
        line("fatal: No configured push destination.", "error"),
        line("Add a remote first: `git remote add origin <url>`.", "hint"),
      ],
      ok: false,
    };
  }

  // The whole point of the exercise: a push is refused when the remote has work
  // you have not seen, because accepting it would discard somebody else's.
  if (state.remoteAhead > 0) {
    return {
      state,
      output: [
        line("! [rejected]        main -> main (fetch first)", "error"),
        line("error: failed to push some refs", "error"),
        line(
          "The remote has commits you do not. Git is protecting a colleague's work, not being awkward — `git pull` first.",
          "hint",
        ),
      ],
      ok: false,
    };
  }

  const local = history(state).map((commit) => commit.id);
  const remote = state.remotes[0];
  const unpushed = local.filter((id) => !remote.commits.includes(id));

  if (unpushed.length === 0) {
    return { state, output: [line("Everything up-to-date", "muted")], ok: true };
  }

  const next = clone(state);
  next.remotes[0].commits = [...new Set([...remote.commits, ...local])];
  next.remotes[0].branches[next.head] = next.branches[next.head]!;

  return {
    state: next,
    output: [
      line(`To ${remote.url}`, "muted"),
      line(`   ${next.head} -> ${next.head}`, "success"),
      line(
        `Pushed ${unpushed.length} commit${unpushed.length === 1 ? "" : "s"}. Your work now exists somewhere other than this machine.`,
        "hint",
      ),
    ],
    ok: true,
  };
}

function doFetch(state: SimState): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  if (state.remotes.length === 0) {
    return { state, output: [line("fatal: no remote configured", "error")], ok: false };
  }

  if (state.remoteAhead === 0) {
    return { state, output: [line("Already up to date.", "muted")], ok: true };
  }

  return {
    state,
    output: [
      line(`From ${state.remotes[0].url}`, "muted"),
      line(`   ${state.remoteAhead} new commit(s) on origin/${state.head}`, "normal"),
      line(
        "Fetch downloaded them and changed none of your files. That is the difference from pull.",
        "hint",
      ),
    ],
    ok: true,
  };
}

function doPull(state: SimState): SimResult {
  const blocked = requireRepo(state);
  if (blocked) return { state, output: blocked, ok: false };

  if (state.remotes.length === 0) {
    return { state, output: [line("fatal: no remote configured", "error")], ok: false };
  }

  if (state.remoteAhead === 0) {
    return { state, output: [line("Already up to date.", "muted")], ok: true };
  }

  const next = clone(state);
  const incoming = next.remoteAhead;
  let parent = next.branches[next.head];

  for (let index = 0; index < incoming; index += 1) {
    const id = `r${next.commits.length + 1}`;
    const commit: SimCommit = {
      id,
      shortSha: shortSha(`${id}:remote`),
      message: `Work from a colleague (${index + 1})`,
      parents: parent ? [parent] : [],
      branch: next.head,
      snapshot: { ...(next.commits.find((c) => c.id === parent)?.snapshot ?? {}) },
    };
    next.commits.push(commit);
    parent = id;
  }

  next.branches[next.head] = parent;
  next.remoteAhead = 0;
  next.remotes[0].commits = [...new Set([...next.remotes[0].commits, ...history(next).map((c) => c.id)])];

  return {
    state: next,
    output: [
      line(`From ${next.remotes[0].url}`, "muted"),
      line("Fast-forward", "success"),
      line(
        `Brought in ${incoming} commit${incoming === 1 ? "" : "s"}. Pull is a fetch followed by a merge — it changed your files.`,
        "hint",
      ),
    ],
    ok: true,
  };
}

function doHelp(state: SimState): SimResult {
  return {
    state,
    output: [
      line("This simulator models these commands:", "normal"),
      line("  git init, status, add, commit, log, diff", "muted"),
      line("  git branch, switch, checkout, merge", "muted"),
      line("  git remote, push, pull, fetch", "muted"),
      line("Plus two that are not Git, standing in for your editor:", "normal"),
      line("  edit <file>, new <file>", "muted"),
      line("Nothing here runs on a real machine — it is a model, built to make the ideas visible.", "hint"),
    ],
    ok: true,
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────

/** A blank slate: files on disk, no repository yet. */
export function emptyState(files: SimFile[] = []): SimState {
  return {
    initialized: false,
    files,
    staged: [],
    commits: [],
    branches: {},
    head: "main",
    remotes: [],
    remoteAhead: 0,
    conflict: null,
  };
}

export function file(name: string, content: string, tracked = false): SimFile {
  return { name, content, tracked, modified: !tracked };
}
